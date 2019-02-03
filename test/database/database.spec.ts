import { Database } from '../../src/database/database';
import { spy, stub, assert, match } from 'sinon';

describe('Class: Database', () => {
    let database: Database;
    let logger: any;
    let mysql: any;

    beforeEach(() => {
        logger = {
            info: spy(),
            error: spy()
        };
        mysql = {
            connection: spy(),
            createConnection: stub()
        };
        database = new Database(logger, mysql);
    });

    afterEach(() => {
        database = undefined;
        logger = undefined;
    });

    describe('When database is initialized', () => {
        it('should throw error if the connection failed', async () => {
            mysql.createConnection.returns({ connect: mysql.connection });


        });
    });

});
