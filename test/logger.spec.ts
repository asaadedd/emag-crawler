import { Logger } from '../src/logger';
import { spy, stub, assert, match } from 'sinon';

describe('class Logger', () => {
    let logger: any;
    let fs: any;
    let moment: any;

    beforeEach(() => {
        fs = {
            appendFileSync: spy(),
            readdirSync: stub().returns([]),
            writeFileSync: spy()
        };
        moment = {
            format: stub()
        };
        moment.constructor = stub().returns({ format: moment.format });
        logger = new Logger(fs, moment.constructor);
        fs.appendFileSync.resetHistory();
        fs.readdirSync.resetHistory();
        fs.writeFileSync.resetHistory();
    });

    afterEach(() => {
        logger = undefined;
        fs = undefined;
        moment = undefined;
    });

    describe('When logger is initialized', () => {
        it('should create the log file if no other file is present', () => {
            fs.readdirSync
                .withArgs('D:\\project\\logger').returns([]);

            logger = new Logger(fs, moment.constructor);

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should create the log file if other files are present', () => {
            fs.readdirSync
                .withArgs('D:\\project\\logger').returns([
                    'emag_crawler_info_0.txt',
                    'emag_crawler_info_1.txt',
                    'emag_crawler_info_4.txt',
                    'emag_crawler_info_2.txt',
                    'emag_crawler_info_3.txt'
                ]);

            logger = new Logger(fs, moment.constructor);

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_5.txt', '');
        });
    });

    describe('When info is logged', () => {
        it('should create the log file if no log file is present', () => {
            fs.writeFileSync = stub();
            fs.readdirSync
                .withArgs('D:\\project\\logger').returns([]);
            fs.writeFileSync
                .withArgs('D:\\project\\logger/emag_crawler_info_0.txt', '').throws();
            logger = new Logger(fs, moment.constructor);
            fs.appendFileSync.resetHistory();
            fs.readdirSync.resetHistory();
            fs.writeFileSync = spy();

            logger.info('message');

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should create the log file if the current log file exceeded the maximum number of lines', () => {
            logger.numberOfLines = 1000;

            logger.info('message');

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should retry the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.onFirstCall().throws();

            logger.info('message');

            assert.calledTwice(fs.appendFileSync);
        });

        it('should retry only 3 times the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.throws();

            logger.info('message');

            assert.calledThrice(fs.appendFileSync);
        });

        it('should write the message in the log file', () => {
            const expectedMessage = '12/12/2018 13:43 INFO : message1\n';
            moment.format.withArgs('DD/MM/YYYY HH:mm').returns('12/12/2018 13:43');
            logger.info('message1');

            assert.calledOnce(fs.appendFileSync);
            assert.calledWith(
                fs.appendFileSync.firstCall,
                'D:\\project\\logger/emag_crawler_info_0.txt',
                expectedMessage
            );
        });
    });

    describe('When error is logged', () => {
        it('should create the log file if no log file is present', () => {
            fs.writeFileSync = stub();
            fs.readdirSync
                .withArgs('D:\\project\\logger').returns([]);
            fs.writeFileSync
                .withArgs('D:\\project\\logger/emag_crawler_info_0.txt', '').throws();
            logger = new Logger(fs, moment.constructor);
            fs.appendFileSync.resetHistory();
            fs.readdirSync.resetHistory();
            fs.writeFileSync = spy();

            logger.error('message', new Error('error1'));

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should create the log file if the current log file exceeded the maximum number of lines', () => {
            logger.numberOfLines = 1000;

            logger.error('message', new Error('error1'));

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should retry the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.onFirstCall().throws();

            logger.error('message', new Error('error1'));

            assert.calledTwice(fs.appendFileSync);
        });

        it('should retry only 3 times the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.throws();

            logger.error('message', new Error('error1'));

            assert.calledThrice(fs.appendFileSync);
        });

        it('should write the message in the log file', () => {
            const expectedMessage = '12/12/2018 13:43 ERROR : message1 error1\n';
            moment.format.withArgs('DD/MM/YYYY HH:mm').returns('12/12/2018 13:43');
            logger.error('message1', new Error('error1'));

            assert.calledOnce(fs.appendFileSync);
            assert.calledWith(
                fs.appendFileSync.firstCall,
                'D:\\project\\logger/emag_crawler_info_0.txt',
                expectedMessage
            );
        });
    });

    describe('When warning is logged', () => {
        it('should create the log file if no log file is present', () => {
            fs.writeFileSync = stub();
            fs.readdirSync
                .withArgs('D:\\project\\logger').returns([]);
            fs.writeFileSync
                .withArgs('D:\\project\\logger/emag_crawler_info_0.txt', '').throws();
            logger = new Logger(fs, moment.constructor);
            fs.appendFileSync.resetHistory();
            fs.readdirSync.resetHistory();
            fs.writeFileSync = spy();

            logger.warn('message');

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should create the log file if the current log file exceeded the maximum number of lines', () => {
            logger.numberOfLines = 1000;

            logger.warn('message');

            assert.calledOnce(fs.writeFileSync);
            assert.calledWith(fs.writeFileSync.firstCall, 'D:\\project\\logger/emag_crawler_info_0.txt', '');
        });

        it('should retry the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.onFirstCall().throws();

            logger.warn('message');

            assert.calledTwice(fs.appendFileSync);
        });

        it('should retry only 3 times the file writing if fails', () => {
            fs.appendFileSync = stub();
            fs.appendFileSync.throws();

            logger.warn('message');

            assert.calledThrice(fs.appendFileSync);
        });

        it('should write the message in the log file', () => {
            const expectedMessage = '12/12/2018 13:43 WARNING : message1\n';
            moment.format.withArgs('DD/MM/YYYY HH:mm').returns('12/12/2018 13:43');
            logger.warn('message1');

            assert.calledOnce(fs.appendFileSync);
            assert.calledWith(
                fs.appendFileSync.firstCall,
                'D:\\project\\logger/emag_crawler_info_0.txt',
                expectedMessage
            );
        });
    })
});
