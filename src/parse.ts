export interface FilterAttributes {
  exclude: boolean;
  name?: string;
  excludeSelf?: boolean;
  includeDependencies?: boolean;
  includeDependents?: boolean;
}

export function parse(filter: string) {
  const attributes: FilterAttributes = {
    exclude: false,
  };

  if (filter.startsWith("!")) {
    attributes.exclude = true;
    filter = filter.substring(1);
  }

  if (filter.endsWith("...")) {
    attributes.includeDependencies = true;
    filter = filter.slice(0, -3);
    if (filter.endsWith("^")) {
      attributes.excludeSelf = true;
      filter = filter.slice(0, -1);
    }
  }

  if (filter.startsWith("...")) {
    attributes.includeDependents = true;
    filter = filter.substring(3);
    if (filter.startsWith("^")) {
      attributes.excludeSelf = true;
      filter = filter.substring(1);
    }
  }

  return attributes;
}
