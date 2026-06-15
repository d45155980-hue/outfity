class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const { keyword } = this.queryStr;
    if (keyword) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this.query = this.query.find({
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { brand: { $regex: escaped, $options: 'i' } },
          { subcategory: { $regex: escaped, $options: 'i' } },
          { sku: { $regex: escaped, $options: 'i' } },
          { tags: { $regex: escaped, $options: 'i' } },
          { sizes: { $regex: escaped, $options: 'i' } },
          { 'colors.name': { $regex: escaped, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ['keyword', 'sortBy', 'page', 'limit'];
    removeFields.forEach((key) => delete queryCopy[key]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryStr.sortBy) {
      const sortBy = this.queryStr.sortBy.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  pagination(resultPerPage = 12) {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || resultPerPage;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
