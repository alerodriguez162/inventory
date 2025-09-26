import { ProductRepository } from '../repositories';
import { CreateProductDto, UpdateProductDto, ProductListQueryDto, SoftDeleteProductDto } from '../dtos';
import { NotFoundError, ConflictError } from '../utils/errors';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(data: CreateProductDto): Promise<any> {
    const { sku, ...productData } = data;

    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(sku);
    if (existingProduct) {
      throw new ConflictError('SKU already exists');
    }

    const product = await this.productRepository.create({
      sku: sku.toUpperCase(),
      ...productData,
    });

    return product.toJSON();
  }

  async getProductById(id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product.toJSON();
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check if SKU is being changed and if it's already taken
    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await this.productRepository.findBySku(data.sku);
      if (existingProduct) {
        throw new ConflictError('SKU already exists');
      }
    }

    const updatedProduct = await this.productRepository.updateById(id, {
      ...data,
      sku: data.sku?.toUpperCase(),
    });
    return updatedProduct!.toJSON();
  }

  async deleteProduct(id: string, reason: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    await this.productRepository.softDelete(id, reason);
  }

  async restoreProduct(id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const restoredProduct = await this.productRepository.restore(id);
    return restoredProduct!.toJSON();
  }

  async getProducts(query: ProductListQueryDto): Promise<any> {
    const { search, category, isActive, includeDeleted, ...pagination } = query;
    
    let filter: any = {};
    
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (search) {
      return this.productRepository.searchProducts(search, pagination);
    }
    
    return this.productRepository.findPaginated(filter, pagination);
  }

  async getActiveProducts(): Promise<any[]> {
    const products = await this.productRepository.findActiveProducts();
    return products.map(product => product.toJSON());
  }

  async getProductsByCategory(category: string): Promise<any[]> {
    const products = await this.productRepository.findByCategory(category);
    return products.map(product => product.toJSON());
  }

  async getProductBySku(sku: string): Promise<any> {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product.toJSON();
  }
}
