#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     04/03/2016
# Copyright:   (c) calebma 2016
# Licence:     <your licence>
#-------------------------------------------------------------------------------
import os
import sys
import textwrap
import utils

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

def avery5160(outfile, addressInput, font='Helvetica', font_size=10, filter_dups=True):
    """
    Uses reportlab to generate mailing labels in avery5160 format.
    Output is a pdf.  This was modified from esri's public notification
    script sample.

    outfile -- output pdf file
    addressInput -- list of address labels (nested list)
                    [[Name, Address, City_St_Zip]...]
    font -- font style for output pdf. Default is "Helvetica"
    font_size -- font size for output labels. default is 10.
    filter_dups -- remove duplicates.  Default is true
    """

    # PDF vars
    utils.Message('Creating labels in Avery 5160 format')
    if os.path.exists(outfile):
        os.remove(outfile)
    out_pdf = canvas.Canvas(outfile, pagesize = letter)
    out_pdf.setFont(font, font_size)
    hs = 0.25
    vs = 10.3
    horizontal_start = hs * inch
    vertical_start = vs * inch
    count = 0

    # loop thru addresses and remove duplicates if chosen
    if filter_dups:
        silly = '~|~'
        count_add = len(addressInput)
        unique = list(set(silly.join(map(str, filter(None, it))) for it in addressInput))
        addresses = [s.split(silly) for s in unique if s.count(silly) in (2,3)]
    else:
        addresses = addressInput

    # write pdf
    for item in sorted(addresses):
        if len(filter(None, [str(i).strip() for i in item])) >= 2:

            if count > 0 and count % 30 == 0 and len(item) > 0:
                out_pdf.showPage()
                out_pdf.setFont(font, font_size)
                horizontal_start = hs * inch
                vertical_start = vs * inch

            # new column
            elif count > 0 and count % 10 == 0 and len(item) > 0:
                horizontal_start += 2.75 *inch
                vertical_start = vs * inch

            label = out_pdf.beginText()
            label.setTextOrigin(horizontal_start, vertical_start)

            # textwrap for labels (no more than 30 chars)
            for detail in item:
                for line in textwrap.wrap(str(detail)[:59], 30):
                    label.textLine(line)

            out_pdf.drawText(label)
            vertical_start -= 1.0 * inch
            count += 1

    # save pdf
    out_pdf.showPage()
    out_pdf.save()
    utils.Message('\nCreated %s\n' %outfile)
    return out_pdf
