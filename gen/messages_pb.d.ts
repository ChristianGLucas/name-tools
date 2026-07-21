// package: christiangeorgelucas.name_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class ParsedName extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getFirst(): string;
  setFirst(value: string): void;

  getMiddle(): string;
  setMiddle(value: string): void;

  getLast(): string;
  setLast(value: string): void;

  getNick(): string;
  setNick(value: string): void;

  getSuffix(): string;
  setSuffix(value: string): void;

  getOriginal(): string;
  setOriginal(value: string): void;

  clearWarningsList(): void;
  getWarningsList(): Array<string>;
  setWarningsList(value: Array<string>): void;
  addWarnings(value: string, index?: number): string;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParsedName.AsObject;
  static toObject(includeInstance: boolean, msg: ParsedName): ParsedName.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParsedName, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParsedName;
  static deserializeBinaryFromReader(message: ParsedName, reader: jspb.BinaryReader): ParsedName;
}

export namespace ParsedName {
  export type AsObject = {
    title: string,
    first: string,
    middle: string,
    last: string,
    nick: string,
    suffix: string,
    original: string,
    warningsList: Array<string>,
    error: string,
  }
}

export class ParseNameInput extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getFixCase(): boolean;
  setFixCase(value: boolean): void;

  getExtendedLists(): boolean;
  setExtendedLists(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseNameInput.AsObject;
  static toObject(includeInstance: boolean, msg: ParseNameInput): ParseNameInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseNameInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseNameInput;
  static deserializeBinaryFromReader(message: ParseNameInput, reader: jspb.BinaryReader): ParseNameInput;
}

export namespace ParseNameInput {
  export type AsObject = {
    name: string,
    fixCase: boolean,
    extendedLists: boolean,
  }
}

export class NameInput extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NameInput.AsObject;
  static toObject(includeInstance: boolean, msg: NameInput): NameInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NameInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NameInput;
  static deserializeBinaryFromReader(message: NameInput, reader: jspb.BinaryReader): NameInput;
}

export namespace NameInput {
  export type AsObject = {
    name: string,
  }
}

export class NameResult extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getFound(): boolean;
  setFound(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NameResult.AsObject;
  static toObject(includeInstance: boolean, msg: NameResult): NameResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NameResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NameResult;
  static deserializeBinaryFromReader(message: NameResult, reader: jspb.BinaryReader): NameResult;
}

export namespace NameResult {
  export type AsObject = {
    value: string,
    found: boolean,
    error: string,
  }
}

export class FormatNameInput extends jspb.Message {
  hasName(): boolean;
  clearName(): void;
  getName(): ParsedName | undefined;
  setName(value?: ParsedName): void;

  getNameRaw(): string;
  setNameRaw(value: string): void;

  getOrder(): string;
  setOrder(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FormatNameInput.AsObject;
  static toObject(includeInstance: boolean, msg: FormatNameInput): FormatNameInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FormatNameInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FormatNameInput;
  static deserializeBinaryFromReader(message: FormatNameInput, reader: jspb.BinaryReader): FormatNameInput;
}

export namespace FormatNameInput {
  export type AsObject = {
    name?: ParsedName.AsObject,
    nameRaw: string,
    order: string,
  }
}

export class FormatNameOutput extends jspb.Message {
  getFormatted(): string;
  setFormatted(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FormatNameOutput.AsObject;
  static toObject(includeInstance: boolean, msg: FormatNameOutput): FormatNameOutput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FormatNameOutput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FormatNameOutput;
  static deserializeBinaryFromReader(message: FormatNameOutput, reader: jspb.BinaryReader): FormatNameOutput;
}

export namespace FormatNameOutput {
  export type AsObject = {
    formatted: string,
    error: string,
  }
}

export class ExtractInitialsInput extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getSeparator(): string;
  setSeparator(value: string): void;

  getExcludeMiddle(): boolean;
  setExcludeMiddle(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractInitialsInput.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractInitialsInput): ExtractInitialsInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractInitialsInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractInitialsInput;
  static deserializeBinaryFromReader(message: ExtractInitialsInput, reader: jspb.BinaryReader): ExtractInitialsInput;
}

export namespace ExtractInitialsInput {
  export type AsObject = {
    name: string,
    separator: string,
    excludeMiddle: boolean,
  }
}

export class PersonNameLikelihood extends jspb.Message {
  getIsLikelyName(): boolean;
  setIsLikelyName(value: boolean): void;

  getConfidence(): number;
  setConfidence(value: number): void;

  clearReasonsList(): void;
  getReasonsList(): Array<string>;
  setReasonsList(value: Array<string>): void;
  addReasons(value: string, index?: number): string;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PersonNameLikelihood.AsObject;
  static toObject(includeInstance: boolean, msg: PersonNameLikelihood): PersonNameLikelihood.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PersonNameLikelihood, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PersonNameLikelihood;
  static deserializeBinaryFromReader(message: PersonNameLikelihood, reader: jspb.BinaryReader): PersonNameLikelihood;
}

export namespace PersonNameLikelihood {
  export type AsObject = {
    isLikelyName: boolean,
    confidence: number,
    reasonsList: Array<string>,
    error: string,
  }
}

export class CompareNamesInput extends jspb.Message {
  getNameA(): string;
  setNameA(value: string): void;

  getNameB(): string;
  setNameB(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompareNamesInput.AsObject;
  static toObject(includeInstance: boolean, msg: CompareNamesInput): CompareNamesInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompareNamesInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompareNamesInput;
  static deserializeBinaryFromReader(message: CompareNamesInput, reader: jspb.BinaryReader): CompareNamesInput;
}

export namespace CompareNamesInput {
  export type AsObject = {
    nameA: string,
    nameB: string,
  }
}

export class NameComparison extends jspb.Message {
  getMatchLevel(): string;
  setMatchLevel(value: string): void;

  getScore(): number;
  setScore(value: number): void;

  clearMatchedFieldsList(): void;
  getMatchedFieldsList(): Array<string>;
  setMatchedFieldsList(value: Array<string>): void;
  addMatchedFields(value: string, index?: number): string;

  hasParsedA(): boolean;
  clearParsedA(): void;
  getParsedA(): ParsedName | undefined;
  setParsedA(value?: ParsedName): void;

  hasParsedB(): boolean;
  clearParsedB(): void;
  getParsedB(): ParsedName | undefined;
  setParsedB(value?: ParsedName): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NameComparison.AsObject;
  static toObject(includeInstance: boolean, msg: NameComparison): NameComparison.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NameComparison, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NameComparison;
  static deserializeBinaryFromReader(message: NameComparison, reader: jspb.BinaryReader): NameComparison;
}

export namespace NameComparison {
  export type AsObject = {
    matchLevel: string,
    score: number,
    matchedFieldsList: Array<string>,
    parsedA?: ParsedName.AsObject,
    parsedB?: ParsedName.AsObject,
    error: string,
  }
}

