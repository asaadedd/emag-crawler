import { createConnection, Connection } from 'mysql';
import { Observable, Observer } from 'rxjs';
import { CONFIG } from '../config';
import { Logger } from '../logger';
import initializeTableSql from './initializeTable.sql';

export class Database {
    private connection: Connection;

    constructor(private logger: Logger, private mysql = { createConnection }) {}

    public async initialize(): Promise<void> {
        await this.connectToDB();
        await this.query(initializeTableSql).toPromise();
        const insert = 'INSERT INTO emag_crawler.products (ID, URL, price, stock)';
        const valuesString = CONFIG.productsUrls.reduce(
            (currentValuesString, productUrl: string, index) =>
                `${currentValuesString} (${index}, '${productUrl}', NULL, NULL),`,
            'VALUES');
        await this.query(`${insert} ${valuesString.substring(0, valuesString.length - 1)}`).toPromise();
    }

    public query(query: string): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            this.connection.query(query, (error, rows) => {
                if (error) {
                    observer.error(error);
                } else {
                    observer.next(rows);
                }
                observer.complete();
            });
        });
    }

    private connectToDB() {
        this.connection = this.mysql.createConnection(CONFIG.database);

        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error) {
                    this.logger.error('Error while connecting to the database', error);
                    reject();
                    return;
                }

                this.logger.info('Successfully connected to the database');
                resolve();
            });
        });
    }
}
