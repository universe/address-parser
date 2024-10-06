# Address Parser
Parse dirty United States postal addresses in to a standard address model.

This repo includes a suite of unit tests for:
 - Residential Addresses
 - Fractional Addresses
 - Grid Addresses
 - Range Addresses
 - Military Addresses
 - PO Boxes
 - Rural Routes
 - Spanish Road Identifiers
 - Care-Of Lines
 - Facility Lines
 - Personal ID Lines
 - International Addresses

Also included in the test suite (but disabled by default) is the USPS CASS1 certification test fixtures data set. Because the CASS certification process expects parsers to spell check street names, correct street type and unit identifiers, etc, this parser does not pass the entire suite. However, excluding these advanced correction features, this little address parser does clear over 78% of the 150,000 fixtures!

## Data Model

This package is fully typed by Typescript. Enum values can be found in the type definitions. A parsed address will take the form:

```gql
interface ISitus {
  care: String
  facility: String
  facilityType: FacilityType

  pinType: PersonalIdentifier
  pinNum: String
  unitAbbr: UnitAbbr
  unitNum: String

  number: String

  streetPreDir: Directional
  streetName: String
  streetType: StreetType
  streetPostDir: Directional

  city: String
  state: State
  zip: String
  zip4: String

  country: Country
}
```

> International addresses are handled by placing the entire address in to the `care` property – with newlines preserved – and specifying the destination country in the `country` proeprty.

## API

This package exposes a number of convenience methods to convert Enum values to and from plain text, and for type checking input tokens. However, the primary interfaces are:

### `parse(...lines: string[]): Promise<ISitus>`
Parse takes one to many address lines and returns a situs object. Line breaks are used as hints for the address parser to differentiate between and care-of, facility, personal identifier, street, city/state/zip lines in an input address. You can designate a line break by passing multiple arguments to the `parse()` function, or by including newlines, or tabs, or commas in the input string. For example, all of the following produce the same ISitus object:

```js
parse('Box 1142', '700 Commonwealth Avenue', 'Boston MA 02215');
parse('Box 1142, 700 Commonwealth Avenue, Boston MA 02215');
parse('Box 1142\n700 Commonwealth Avenue\nBoston MA 02215');
parse('Box 1142 700 Commonwealth Avenue Boston MA 02215');
```

### The `Address` class
The `Address` class contain convenience methods to export a given parsed address in a number of formats.

#### `Address.constructor(...lines: string[] | ISitus)`
The `Address` constructor can accept the same input as `parse()`, or a pre-parsed `ISitus` interface.

#### `public Address.label(): USPSLabel`
The `Address.label()` method returns an object with USPS designated fields label in the following format:

```ts
interface USPSLabel {
  care: string | null;
  urbanization: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: State | null;
  zip: string | null;
  zip4: string | null;
  country: string | null;
}
```

#### `public Address.lines(): [string | null, string | null, string | null, string | null]`
The `Address.lines()` method returns four lines that can be printed on an address label in the USPS preferred format. Ex:

```js
const addr = new Address('P.O Box 123-ABC', 'Loon Lake WA, 99148')
console.log(addr.lines())
// Logs: [ 'PO BOX 123ABC', 'LOON LAKE WA  99148', null, null ],
```

#### `public Address.print(): string`
The `Address.print()` prints the standard USPS four line label as a single string with newlines. Ex:

```js
const addr = new Address('P.O Box 123-ABC', 'Loon Lake WA, 99148')
console.log(addr.lines())
// Logs:
// PO BOX 123ABC
// LOON LAKE WA  99148
```

#### `static Address.label(situs?: ISitus | null): USPSLabel`
A functional version of the `Address.label` method above. Pass it a situs and it will output a `USPSLabel` object.

#### `static Address.lines(situs?: ISitus | null): [string | null, string | null, string | null, string | null]`
A functional version of the `Address.lines` method above. Pass it a situs and it will output an array of printable address lines.

#### `static Address.print(situs?: ISitus | null): string`
A functional version of the `Address.print` method above. Pass it a situs and it will output a multi-line string of the USPS formatted address.

## Contributing

Pull requests are welcome! Check out this repository, run `yarn` to install dependencies, and run tests with `yarn test`. To run the CASS1 test suite, run `yarn test:cass`. There are currently 32,305 known failing CASS1 tests. No contributions should reduce test coverage.
