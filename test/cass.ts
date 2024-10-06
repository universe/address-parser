// Source: https://postalpro.usps.com/CASS/NATLSTG1.zip
// Spec: https://postalpro.usps.com/mnt/glusterfs/218-2/CASSTECH_N_0.pdf
// https://postalpro.usps.com/address-quality/AIS_Products_Pricing
/* global describe, it */

import { State } from '@universe/models';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { compareLabel } from './_util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* eslint-disable-next-line */
import Readline from 'n-readlines';

type Slice<T> = { desc: string; start: number; end: number; length: number; transform?: (v: string) => T };
type Slicer<T> = { [key in keyof T]: Slice<T[key]> }

interface CASSTest {
  id: string;
  zipAnswer: string;
  altZipAllowed: boolean;
  zip4Answer: string;
  dpAnswer: string;
  dpCheckAnswer: string;
  crAnswer: string;
  altCrAllowed: boolean;
  cityAnswer: string;
  altCityAllowed: boolean;
  stateAnswer: string;
  urbanizationAnswer: string;
  firmNameAnswer: string;
  line1Answer: string;
  altLine1Allowed: boolean;
  line2Answer: string;
  altLine2Allowed: boolean;

  firmInput: string;
  urbanizationInput: string;
  line1Input: string;
  line2Input: string;
  lastLineInput: string;

  altZip4Answer1: string;
  altZip4Answer2: string;
  pmbType: string;
  pmbNum: string;
}

function parse<T>(line: string, slicer: Slicer<T>): T {
  const OUT = {} as T;
  for (const name of (Object.keys(slicer) as (keyof T)[])) {
    const field = slicer[name];
    const val = line.slice(field.start - 1, field.start - 1 + field.length).trim();
    OUT[name] = (field.transform ? field.transform(val) : val) as T[keyof T];
    if (typeof OUT[name] === 'string') {
      OUT[name] = String(OUT[name]).trim() as T[keyof T];
    }
  }
  return OUT;
}

function isAllowed(val: string): boolean { return String(val).toUpperCase() === 'Y'; }

const CASS_SLICER: Slicer<CASSTest> = {
  // key1: { desc: 'Customer ID', length: 9, start: 1, end: 9, },
  id: { desc: 'CASS Key', length: 11, start: 10, end: 20 },

  // ANSWERS
  zipAnswer: { desc: 'ZIP Code Answer', length: 5, start: 21, end: 25 },
  altZipAllowed: { desc: 'ZIP Code Alternate Answer Allowed*', length: 1, start: 26, end: 26 },
  // key5: { desc: 'ZIP Code Include in 3553', length: 1, start: 27, end: 27 },
  zip4Answer: { desc: 'ZIP + 4 Add-On Answer', length: 4, start: 28, end: 31 },
  // key7: { desc: 'ZIP + 4 Add-On Include in 3553*', length: 1, start: 32, end: 32 },
  dpAnswer: { desc: 'Delivery Point Answer', length: 2, start: 33, end: 34 },
  // key9: { desc: 'Filler', length: 1, start: 35, end: 35 },
  dpCheckAnswer: { desc: 'Delivery Point Check Digit Answer', length: 1, start: 36, end: 36 },
  crAnswer: { desc: 'Carrier Route Answer', length: 4, start: 37, end: 40 },
  altCrAllowed: { desc: 'Carrier Route Alternate Answer Allowed*', length: 1, start: 41, end: 41, transform: isAllowed },
  // key13: { desc: 'Carrier Route Include in 3553*', length: 1, start: 42, end: 42 },
  cityAnswer: { desc: 'City Name Answer', length: 28, start: 43, end: 70 },
  altCityAllowed: { desc: 'City Name Alternate Answer Allowed*', length: 1, start: 71, end: 71, transform: isAllowed },
  stateAnswer: { desc: 'State Code Answer', length: 2, start: 72, end: 73 },
  urbanizationAnswer: { desc: 'Urbanization Answer', length: 28, start: 74, end: 101 },
  firmNameAnswer: { desc: 'Firm Name Answer', length: 40, start: 102, end: 141 },
  line1Answer: { desc: 'Primary Delivery Address Line Answer', length: 64, start: 142, end: 205 },
  altLine1Allowed: { desc: 'Primary Delivery Address Line Alt. Answer Allowed*', length: 1, start: 206, end: 206, transform: isAllowed },
  line2Answer: { desc: 'Second Delivery Address Line Answer', length: 64, start: 207, end: 270 },
  altLine2Allowed: { desc: 'Second Delivery Address Line Alt. Answer Allowed*', length: 1, start: 271, end: 271, transform: isAllowed },
  // key23: { desc: 'Locatable Address Conversion Indicator', length: 1, start: 272, end: 272 },
  // key24: { desc: 'Enhanced line of Travel (eLOT) Sequence Number Answer', length: 4, start: 273, end: 276 },
  // key25: { desc: 'Enhanced line of Travel (eLOT) Ascending/Descending Answer', length: 1, start: 277, end: 277 },

  // INPUTS
  firmInput: { desc: 'Firm or Recipient Input', length: 40, start: 278, end: 317 },
  urbanizationInput: { desc: 'Urbanization Input', length: 28, start: 318, end: 345 },
  line1Input: { desc: 'Primary Delivery Address Line Input', length: 64, start: 346, end: 409 },
  line2Input: { desc: 'Second Delivery Address Line Input', length: 64, start: 410, end: 473 },
  lastLineInput: { desc: 'Last Line Input', length: 42, start: 474, end: 515 },
  // key31: { desc: 'Filler', length: 1, start: 516, end: 516 },
  // key32: { desc: 'Record Type Code', length: 1, start: 517, end: 517 },
  // key33: { desc: 'Category Subcategory Indicator*', length: 2, start: 518, end: 519 },
  // key34: { desc: 'USPS Internal Research Development Flag*', length: 1, start: 520, end: 520 },
  // key35: { desc: 'Non-Deliverable Record Indicator*', length: 1, start: 521, end: 521 },
  altZip4Answer1: { desc: 'Multiple Response ZIP + 4 Answer 1*', length: 9, start: 522, end: 530 },
  altZip4Answer2: { desc: 'Multiple Response ZIP + 4 Answer 2*', length: 9, start: 531, end: 539 },
  pmbType: { desc: 'PMB-Designator', length: 4, start: 540, end: 543 },
  pmbNum: { desc: 'PMB-Number', length: 8, start: 544, end: 551 },
  // key40: { desc: 'Default Flag', length: 1, start: 552, end: 552 },
  // key41: { desc: 'Internal Use', length: 1, start: 553, end: 553 },
  // key42: { desc: 'Early Warning System (EWS)', length: 1, start: 554, end: 554 },
  // key43: { desc: 'Internal Use', length: 1, start: 555, end: 555 },
  // key44: { desc: 'Enhanced Line of Travel (eLOT) Sequence Number Answer', length: 4, start: 556, end: 559 },
  // key45: { desc: 'Enhanced Line of Travel (eLOT) Ascending/Descending Answer', length: 1, start: 560, end: 560 },
  // key46: { desc: 'DPV Confirmation Indicator', length: 1, start: 561, end: 561 },
  // key47: { desc: 'DPV CMRA Indicator', length: 1, start: 562, end: 562 },
  // key48: { desc: 'DPV False Positive Indicator', length: 1, start: 563, end: 563 },
  // key49: { desc: 'DSF2 Delivery Type', length: 1, start: 564, end: 564 },
  // key50: { desc: 'DPV/ DSF2 No Stats Indicator', length: 1, start: 565, end: 565 },
  // key51: { desc: 'DSF2 Business Indicator', length: 1, start: 566, end: 566 },
  // key52: { desc: 'DSF2 Drop Indicator', length: 1, start: 567, end: 567 },
  // key53: { desc: 'DSF2 Drop Count', length: 3, start: 568, end: 570 },
  // key54: { desc: 'DSF2 Throwback Indicator', length: 1, start: 571, end: 571 },
  // key55: { desc: 'DSF2 Seasonal Indicator', length: 1, start: 572, end: 572 },
  // key56: { desc: 'DPV/ DSF2 Vacant Indicator', length: 1, start: 573, end: 573 },
  // key57: { desc: 'DSF2 LACS Indicator', length: 1, start: 574, end: 574 },
  // key58: { desc: 'DSF2 Educational Indicator', length: 1, start: 575, end: 575 },
  // key59: { desc: 'DPV Footnote 1', length: 2, start: 576, end: 577 },
  // key60: { desc: 'DPV Footnote 2', length: 2, start: 578, end: 579 },
  // key61: { desc: 'DPV Footnote 3', length: 2, start: 580, end: 581 },
  // key62: { desc: 'Filler', length: 5, start: 582, end: 586 },
  // key63: { desc: 'DSF2 Primary Number Error Flag', length: 1, start: 587, end: 587 },
  // key64: { desc: 'DSF2 Secondary Number Error Flag', length: 1, start: 588, end: 588 },
  // key65: { desc: 'Residential Delivery Indicator', length: 1, start: 589, end: 589 },
  // key66: { desc: 'DSF2 Pseudo Sequence Number', length: 4, start: 590, end: 593 },
  // key67: { desc: 'LACSLink Indicator', length: 1, start: 594, end: 594 },
  // key68: { desc: 'LACSLink Return Code', length: 2, start: 595, end: 596 },
  // key69: { desc: 'SuiteLink Return Code', length: 2, start: 597, end: 598 },
  // key70: { desc: 'Internal Use', length: 2, start: 599, end: 600 },
};

// These should pass! Un-comment to focus these tests.
const enabled = new Set<string>([
  // '9955693193',
  // '9915470277',
  // '9965672835',
  // '9995489685',
  // '9965397157',
  // '9925875464',
  // '9965883800',
  // '9975757407',
  // '9955082536',
]);

describe('CASS 1 Tests Series N', () => {
  const assetPath = path.join(__dirname, '..', '..', 'fixtures', 'CASS1_N.txt');
  const readline = new Readline(assetPath);
  let line: false | Buffer;
  let i = 0;
  while ((line = readline.next()) !== false) {
    const out = parse<CASSTest>(line.toString(), CASS_SLICER);
    if (process.env.CASS_SUITE !== 'enabled') { break; }
    if (enabled.size && !enabled.has(out.id)) { continue; };
    /* eslint-disable-next-line jest/expect-expect */
    it(`Passes CASS 1 Test Certification: Line ${i++} #${out.id}: ${[ out.firmInput, out.urbanizationInput, out.line1Input, out.line2Input, out.lastLineInput ].filter(Boolean).join(', ')}`, () => {
      // console.log(out);
      compareLabel([ out.firmInput, out.urbanizationInput, out.line1Input, out.line2Input, out.lastLineInput ], {
        care: out.firmNameAnswer || null,
        urbanization: out.urbanizationAnswer || null,
        // pinNum: out.pmbNum || null,
        // pinType: out.pmbType as PersonalIdentifier || null,
        line1: out.line1Answer || null,
        line2: out.line2Answer || null,
        city: out.cityAnswer || null,
        state: out.stateAnswer as State || null,
        zip: out.zipAnswer || null,
        zip4: out.zip4Answer || null,
        // dp: out.dpAnswer || null,
        // dpCheck: out.dpCheckAnswer || null,
      }, out.id);
    });
  }
});
