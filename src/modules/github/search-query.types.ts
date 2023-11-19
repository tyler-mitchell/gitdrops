/* eslint-disable @typescript-eslint/no-explicit-any */
export type QualifierFilterId = string;

export type QualifierId = string;

export type QualifierValue = string;

export type Qualifier = {
  qualifier: string;
  value: QualifierValue;
};

export type QualifierOption = {
  label: React.ReactNode;
  qualifierValue: QualifierValue;
  iconClassName?: string;
  groupId?: string;
};

export type QualifierOptionGroup = {
  groupLabel: string;
  groupId: string;
  options: QualifierOption[];
  showIcons?: boolean;
  isPrimary?: boolean;
};

export type QualifierOptionMap = Map<string, QualifierOption>;

export type QualifierOptionMapEntry = [string, QualifierOption];

export interface QualifierConfig {
  qualifier: QualifierId;
  required?: boolean;
  defaultValue: QualifierValue;
  options: QualifierOption[];
  Icon?: (...args: any[]) => JSX.Element | React.ReactElement<any, any>;
  optionGroups?: QualifierOptionGroup[];
  width?: React.CSSProperties["width"];
  inputProps?: {
    showIcon?: boolean;
    placeholder?: string;
    className?: string;
  };
  listItemProps?: {
    showIcon?: boolean;
  };
  searchProps?: {
    placeholder?: string;
    searchable?: boolean;
  };
  listProps?: {
    emptyLabel?: string;
  };
}

export interface ResolvedQualifierConfig extends QualifierConfig {
  optionMap: QualifierOptionMap;
  value?: string;
  allOptions: QualifierOption[];
  allOptionGroups: QualifierOptionGroup[];
}

export type QualifierOptions = Pick<
  QualifierConfig,
  "options" | "optionGroups"
>;

export type QualifierConfigMap = Record<QualifierFilterId, QualifierConfig>;

export type ResolvedQualifierConfigMap = Record<
  QualifierFilterId,
  ResolvedQualifierConfig
>;
