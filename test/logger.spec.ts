import { Logger } from '../src/logger';
import { when } from 'jest-when';

describe('class Logger', () => {
    let logger, fs: any;

    beforeEach(() => {
        fs = {
            appendFile: jest.fn(),
            readdirSync: jest.fn(),
            writeFileSync: jest.fn()
        };
        jest.mock('fs', () => fs);
        logger = new Logger();
    });

    afterEach(() => {
        logger = undefined;
    });

    describe('When logger is initialized', () => {
        it('should create the log file if no other file is present', () => {
            when(fs.readdirSync)
                .calledWith('D:\\project\\logger]').mockReturnValue('yay!')
        });
    });
});
