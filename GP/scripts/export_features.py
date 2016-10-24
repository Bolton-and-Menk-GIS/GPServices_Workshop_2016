#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     20/10/2016
# Copyright:   (c) calebma 2016
# Licence:     <your licence>
#-------------------------------------------------------------------------------
from __future__ import print_function
import arcpy
import os
import json
import sys
import tempfile

# network share
sys.path.append(r'\\arcdev\dev\gis_lis\GPServices_Workshop_2016\GP\python')
import utils

if sys.version_info[0] >= 3:
    basestring = str

arcpy.env.overwriteOutput = True

@utils.timeit
def export_features(features, out_name='Parcels', gdb=True):

    # step 1. get config
    stamp = utils.timestamp()
    config = utils.read_config()
    temp_dir = config.get('temp_dir')
    out_name = utils.clean_filename(out_name)
    out_folder = os.path.join(temp_dir, '{}_{}'.format(out_name, stamp))
    if not os.path.exists(out_folder):
        os.makedirs(out_folder)

    # step 2. write out temp json
    tmp = tempfile.mktemp('.json', 'gpExport_{}'.format(stamp))
    with open(tmp, 'w') as f:
        if isinstance(features, basestring):
            # pass through JSON parser, just to be safe
            features = json.loads(features)
        json.dump(features, f)

    # step 3. if gdb, create gdb and add domains if there are any
    if gdb in (True, 'true'):

        ws = arcpy.management.CreateFileGDB(out_folder, out_name + '.gdb').getOutput(0)
        output = os.path.join(ws, out_name)
        dom_map = {}
        for field in features.get('fields', []):
            if field.get('domain'):
                print('domain name: ', field['domain']['name'])
                field_name = field['name'].split('.')[-1]  #sometimes SDE fields have periods in the names...
                dom_map[field_name] = field['domain']['name']

                if 'codedValues' in field['domain']:
                    dType = 'CODED'
                else:
                    dType = 'RANGE'

                # create domain
                arcpy.management.CreateDomain(ws, field['domain']['name'],
                                              field['domain']['name'],
                                              utils.FTYPES[field['type']],
                                              dType)
                if dType == 'CODED':
                    for cv in field['domain']['codedValues']:
                        arcpy.management.AddCodedValueToDomain(ws, field['domain']['name'], cv['code'], cv['name'])
                elif dType == 'RANGE':
                    _min, _max = field['domain']['range']
                    arcpy.management.SetValueForRangeDomain(ws, field['domain']['name'], _min, _max)

                print('Added domain "{}" to database: "{}"'.format(field['domain']['name'], ws))

        # step 4. Create features from JSON
        output = os.path.join(ws, out_name)
        arcpy.conversion.JSONToFeatures(tmp, output)

         # add domains to features
        field_list = [f.name.split('.')[-1] for f in arcpy.ListFields(output)]
        for fld, dom_name in dom_map.iteritems():
            if fld in field_list:
                arcpy.management.AssignDomainToField(output, fld, dom_name)
                print('Assigned domain "{}" to field "{}"'.format(dom_name, fld))

    # step 3. else if shapefile
    else:
        output = os.path.join(out_folder, out_name + '.shp')

        # step 4. Create features from JSON
        arcpy.conversion.JSONToFeatures(tmp, output)

    # delete temporary JSON file
    try:
        os.remove(tmp)
    except:
        pass

    # step 5. zip folder and return url
    # clean up temp dir if config tells us to
    if config.get('clean_dirs', False) in (True, 'true'):
        utils.remove_files(temp_dir, subdirs=True, minutes=10)
        utils.remove_folders(temp_dir, minutes=10)

    # zip
    zipped = utils.zipdir(out_folder)

    # we need to form a url to download, the temp_dir should always be in a
    # web enabled path (pulled from config.json)
    url = '/'.join([config.get('web_path'), os.path.basename(zipped)])
    utils.Message('Succesfully created download link: "{}"'.format(url))
    arcpy.SetParameter(3, url)

if __name__ == '__main__':

    # GP Tool
    args = [arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()-1)]
    export_features(*args)

##    # testing
##    fold = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'python', 'tests')
##    feature_file = os.path.join(fold, 'features_with_geometry.json')
##    with open(feature_file, 'r') as f:
##        features = json.load(f)
##
##    export_features(features)
##
##    features_dom_file = os.path.join(fold, 'features_with_domains.json')
##    with open(features_dom_file, 'r') as f:
##        features_dom = json.load(f)
##
##    export_features(features_dom, 'Plots')


