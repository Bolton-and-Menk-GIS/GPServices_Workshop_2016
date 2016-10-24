#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     10/10/2016
# Copyright:   (c) calebma 2016
# Licence:     <your licence>
#-------------------------------------------------------------------------------
import arcpy
import os
import json
import time
import sys

# add path to shared scripts here!
sys.path.append(r'\\arcdev\dev\gis_lis\GPServices_Workshop_2016\GP\python')

# imports from python folder
import xlwt
import utils
import mailing

if sys.version_info[0] >= 3:
    basestring = str

# default styles
# center alignment
alignCenter = xlwt.Alignment()
alignCenter.horz = xlwt.Alignment.HORZ_CENTER
alignCenter.vert = xlwt.Alignment.VERT_CENTER

# header fonts
headerFont = xlwt.Font()
headerFont.height = 220
headerFont.name = 'Arial'
headerFont.bold = True

# header style
defaultStyleHeaders = xlwt.XFStyle()
defaultStyleHeaders.font = headerFont
defaultStyleHeaders.alignment.wrap = True
defaultStyleHeaders.alignment = alignCenter
defaultStyleHeaders.font = headerFont

def export_reports(feature_set, owner_fields, address_fields, csz_fields, use_aliases=True):
    """exports an excel file and mailing labels

    Required:
        feature_set -- feature set response from query operation
        owner_fields -- owner name field(s) separated by commas
        address_fields -- address field(s) separated by commas
        csz_fields -- City, State Zip field(s) separated by commas

    Optional:
        use_aliases -- option to use field name aliases in excel file
    """
    # step 1. parse feature set into dictionary
    if isinstance(feature_set, (arcpy.RecordSet, arcpy.FeatureSet)):
        feature_set = json.loads(feature_set.JSON)
    elif isinstance(feature_set, arcpy.mapping.Layer):
        feature_set = arcpy.FeatureSet(feature_set).JSON
    elif isinstance(feature_set, basestring):
        feature_set = json.loads(feature_set)

    # step 2. initialize excel
    wb = xlwt.Workbook()
    ws = wb.add_sheet('Parcels')

    # step 3. add headers
    headers, field_names = [], []
    for f in feature_set.get('fields', []):
        if use_aliases in (True, 'true'):
            headers.append(f['alias'])
        else:
            headers.append(f['name'])
        field_names.append(f['name'])

    # default column widths
    colwidths = {}
    for ci,h in enumerate(headers):
        ws.write(0, ci, h, defaultStyleHeaders)
        colwidths[ci] = len(h) + 1

    # step 4. iterate through feature set
    addresses = []
    features = feature_set.get('features', [])
    for ri,feature in enumerate(features):

        for ci,f in enumerate(field_names):
            value = feature['attributes'].get(f)
            ws.write(ri+1, ci, value)

            # check if we need to widen the column
            thisLength = len(unicode(value)) + 1
            if thisLength > colwidths[ci]:
                colwidths[ci] = thisLength

        # flush rows at every 1000 features (usually won't exceed this?)
        if not ri % 1000 and hasattr(ws, 'flush_rows'):
            ws.flush_rows()

        # get mailing label info
        owner_name = owner_fields.format(**feature.get('attributes'))
        address = address_fields.format(**feature.get('attributes'))
        csz = csz_fields.format(**feature.get('attributes'))
        if not any(map(lambda s: s == 'None', [owner_name, address, csz])):
            # exclude those that do not have values
            addresses.append([owner_name, address, csz])

    # step 5. set up output xls and pdf files and clean up temp dir
    config = utils.read_config()
    stamp = time.strftime('%Y%m%d%H%M%S')
    temp_dir = os.path.join(config.get('temp_dir'), 'Parcels_{}'.format(stamp))
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    out_excel = os.path.join(temp_dir, 'Parcels.xls')
    out_pdf = os.path.join(temp_dir, 'MailingLabels.pdf')

    # clean up temp dir if config tells us to
    if config.get('clean_dirs', False) in (True, 'true'):
        utils.remove_files(temp_dir, subdirs=True, minutes=10)
        utils.remove_folders(temp_dir, minutes=10)

    # step 6. format sheet and save excel file
    # freeze panes
    ws.set_panes_frozen(True)
    ws.set_horz_split_pos(1)

    # autofit columns (Width is 1/256 the width of the zero character for the default font)
    for i, width in sorted(colwidths.iteritems()):
        ws.col(i).width = min([width * 350, 65535])
    wb.save(out_excel)

    # step 7. export mailing labels
##    mailing.avery5160(out_pdf, addresses)

    # step 8. Zip files and return json
    zipped = utils.zipdir(temp_dir)

    # we need to form a url to download, the temp_dir should always be in a
    # web enabled path (pulled from config.json)
    url = '/'.join([config.get('web_path'), os.path.basename(zipped)])
    utils.Message('Succesfully created download link: "{}"'.format(url))
    arcpy.SetParameter(5, url)

if __name__ == '__main__':

    # run tool
    args =[arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()-1)] #last argument is output param
    export_reports(*args)

##    # TEST it here first!
##    test = '../python/tests/feature_set_test.json'
##    with open(test, 'r') as f:
##        features = json.load(f)
##    owner_fields = '{OWNAME}'
##    address = '{TXADR1}'
##    csz = '{TXADR2}'
##    export_reports(features, owner_fields, address, csz)