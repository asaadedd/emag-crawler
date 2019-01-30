import axios from 'axios';
import { JSDOM } from 'jsdom';
import { interval, Observable, throwError, from } from 'rxjs';
import { catchError, map, concatMap, toArray, filter } from 'rxjs/operators';
import { isNaN } from 'lodash';
import { CONFIG } from '../config';
import { Database } from '../database/database';
import { Logger } from '../logger';
import { MailSender } from '../mail/mailSender';

export class ProductUpdater {
    constructor(private mailSender: MailSender, private database: Database, private logger: Logger) {}

    public startWatching(): void {
        this.logger.info('Started watching for products updates');
        interval(CONFIG.refreshTime)
            .pipe(
                concatMap(() => this.getUpdatedProducts()),
                filter((updatedProducts: UpdatedProduct[]) => {
                    const areSomeProductsUpdated = !!updatedProducts
                        .filter(product => ProductUpdater.isProductUpdated(product))
                        .length;

                    if (!areSomeProductsUpdated) {
                        this.logger.info('No products updated');
                    }

                    return areSomeProductsUpdated;
                })
            )
            .subscribe(async (productInfo: UpdatedProduct[]) => {
                await this.mailSender.sentChangeEmail(productInfo);
                this.updateProducts(productInfo);
            });
    }

    private getUpdatedProducts(): Observable<UpdatedProduct[]> {
        this.logger.info('Retrieving information for products');
        return this.database.query('SELECT ID, URL, price, stock FROM emag_crawler.products;')
            .pipe(
                concatMap((products: ProductInfo[]) =>
                    from(products).pipe(
                        concatMap(product => this.getInformationForSingleProduct(product)),
                        toArray()
                    )
                ),
                catchError((error) => {
                    this.logger.error('Error while fetching the products URLs', error);
                    return throwError(error);
                })
            );
    }

    private getInformationForSingleProduct(product: ProductInfo): Observable<UpdatedProduct> {
        this.logger.info(`Retrieving information from : ${product.URL}`);
        return from(axios.get(product.URL))
            .pipe(
                map((productHtml) => {
                    const productDom = new JSDOM(productHtml.data);

                    return {
                        ID: product.ID,
                        url: product.URL,
                        name: this.getName(productDom),
                        currentPrice: this.getPrice(productDom),
                        previousPrice: product.price,
                        currentStock: this.getStock(productDom),
                        previousStock: product.stock
                    };
                })
            );
    }

    private updateProducts(products: UpdatedProduct[]): void {
        const insert = 'INSERT INTO emag_crawler.products (ID, URL, price, stock)';
        const valuesString = products.reduce((currentValuesString, product: UpdatedProduct) => {
            const productInfo = `(${product.ID}, '${product.url}', ${product.currentPrice}, '${product.currentStock}')`;
            return `${currentValuesString} ${productInfo},`;
        },                                   'VALUES');
        const updateValues = 'ID=VALUES(ID), URL=VALUES(URL), price=VALUES(price), stock=VALUES(stock)';
        const condition = `ON DUPLICATE KEY UPDATE ${updateValues}`;
        const updateProductsSql = `${insert} ${valuesString.substring(0, valuesString.length - 1)} ${condition}`;

        this.database.query(updateProductsSql)
            .subscribe(
                () => this.logger.info('Products updated in database'),
                error => this.logger.error('Error while updating products', error)
            );
    }

    private getPrice(productDom: JSDOM): number {
        const priceDom = productDom.window.document.querySelector(CONFIG.selectors.price);
        if (priceDom) {
            const basePrice = priceDom.firstChild.textContent.trim().replace('.', '');
            const decimal = priceDom.querySelector('sup').innerHTML.trim();

            return parseFloat(`${basePrice}.${decimal}`);
        }

        this.logger.warn(`Error in finding price element : ${productDom.serialize()}`);

        return NaN;
    }

    private getStock(productDom: JSDOM): string {
        const stockDom = productDom.window.document.querySelector(CONFIG.selectors.stock);
        if (stockDom) {
            return stockDom.innerHTML.trim();
        }

        this.logger.warn(`Error in finding stock element: ${productDom.serialize()}`);

        return CONFIG.unknownStock;
    }

    private getName(productDom: JSDOM): string {
        const stockDom = productDom.window.document.querySelector(CONFIG.selectors.name);
        if (stockDom) {
            return stockDom.innerHTML.trim();
        }
        this.logger.warn(`Error in finding name element: ${productDom.serialize()}`);

        return CONFIG.unknownName;
    }

    private static isProductUpdated(updatedProduct: UpdatedProduct): boolean {
        return !isNaN(updatedProduct.currentPrice) && updatedProduct.currentStock !== CONFIG.unknownStock &&
            (
                updatedProduct.previousStock !== updatedProduct.currentStock ||
                updatedProduct.previousPrice !== updatedProduct.currentPrice
            );
    }
}

interface ProductInfo {
    ID: number;
    URL: string;
    stock: string;
    price: number;
}

export interface UpdatedProduct {
    ID: number;
    url: string;
    name: string;
    currentStock: string;
    previousStock: string;
    currentPrice: number;
    previousPrice: number;
}
