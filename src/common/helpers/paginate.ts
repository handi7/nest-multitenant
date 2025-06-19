export interface PaginateOptions {
  page?: number;
  limit?: number;
  searchFields?: string[];
  search?: string;
  sortBy?: string;
  desc?: boolean;
}

interface PaginateArgs {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

export async function paginate<T, Args extends PaginateArgs, R = T>(
  prismaModel: {
    findMany: (args: Args) => Promise<T[]>;
    count: (args?: any) => Promise<number>;
  },
  args: Args,
  options: PaginateOptions = {},
  mapper?: (item: T) => R,
) {
  const {
    page = 1,
    limit = 10,
    search = "",
    searchFields = [],
    sortBy = "",
    desc = false,
  } = options;

  const where = args.where || {};

  if (search && searchFields.length) {
    const searchQuery = searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    }));

    where.OR = searchQuery;
  }

  const orderBy = sortBy ? [{ [sortBy]: desc ? "desc" : "asc" }] : [];

  const [data, total] = await Promise.all([
    prismaModel.findMany({
      ...args,
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prismaModel.count({ where }),
  ]);

  const transformed = mapper ? data.map(mapper) : data;

  const totalPages = Math.ceil(total / limit);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return {
    data: transformed,
    meta: {
      total,
      totalPages,
      page,
      limit,
      prevPage,
      nextPage,
      search,
      sortBy: sortBy || null,
      desc,
    },
  };
}
