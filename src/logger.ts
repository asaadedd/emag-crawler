import fs from 'fs';
import { CONFIG } from './config';
import { isUndefined } from 'lodash';

export class Logger {
    private static readonly MAXIMUM_NUMBER_OF_LINES: number = 1000;
    private static readonly MAXIMUM_FILE_RETRY: number = 5;
    private static readonly MAXIMUM_WRITE_RETRY: number = 3;
    private static readonly FILE_NAME: string = 'emag_crawler_info';
    private numberOfLines: number;
    private currentFileName: string;
    private fileCreationRetry: number;

    constructor() {
        this.fileCreationRetry = 0;
        this.numberOfLines = 0;
        this.createNewFileIfNeeded();
    }

    public info(loggingString: string) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(Logger.getInfoString(loggingString), 0);
        }
    }

    public error(loggingString: string, error: Error) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(Logger.getErrorString(loggingString, error), 0);
        }
    }

    public warn(loggingString: string) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(Logger.getWarnString(loggingString), 0);
        }
    }

    private writeInFile(stringToWrite: string, retryNumber: number) {
        if (this.currentFileName) {
            const filePath = `${CONFIG.logLocation}/${this.currentFileName}`;
            fs.appendFile(filePath, `${stringToWrite}\n`, (err) => {
                if (err && retryNumber <= Logger.MAXIMUM_WRITE_RETRY) {
                    this.writeInFile(stringToWrite, retryNumber + 1);
                } else if (!err) {
                    this.numberOfLines = this.numberOfLines + 1;
                }
            });
        }
    }

    private createNewFileIfNeeded() {
        if (this.numberOfLines >= Logger.MAXIMUM_NUMBER_OF_LINES || !this.currentFileName) {
            const latestFileNumber = Logger.getLatestLogFileNumber();
            if (!isUndefined(latestFileNumber)) {
                const newFileNumber = latestFileNumber + 1;
                this.createNewFile(newFileNumber);
            } else {
                this.createNewFile(0);
            }
            this.numberOfLines = 0;
        }
    }

    private createNewFile(fileNumber: number) {
        try {
            this.fileCreationRetry = this.fileCreationRetry + 1;
            fs.writeFileSync(`${CONFIG.logLocation}/${Logger.FILE_NAME}_${fileNumber}.txt`, '');
            this.currentFileName = `${Logger.FILE_NAME}_${fileNumber}.txt`;
        } catch (error) {
            if (this.fileCreationRetry <= Logger.MAXIMUM_FILE_RETRY) {
                this.createNewFile(fileNumber);
            }
        }
    }

    private static getLatestLogFileNumber(): number {
        const allFiles = fs.readdirSync(CONFIG.logLocation);
        const fileNumbers = allFiles.map((fileName: string) =>
            parseInt(this.getFileNumber(fileName), 10)
        );

        fileNumbers.sort((firstNumber, secondNumber) => firstNumber - secondNumber);

        return fileNumbers[fileNumbers.length - 1];
    }

    private static getFileNumber(fileName: string) {
        const getNumberExpression = new RegExp(`${Logger.FILE_NAME}_(.*).txt`, 'g');
        const result = getNumberExpression.exec(fileName);

        return result && result.length && result[1];
    }

    private static getInfoString(infoString: string): string {
        return `${new Date().toString()} INFO : ${infoString}`;
    }

    private static getErrorString(errorString: string, error: Error): string {
        return `${new Date().toString()} ERROR : ${errorString} ${error.message}`;
    }

    private static getWarnString(infoString: string): string {
        return `${new Date().toString()} WARNING : ${infoString}`;
    }
}
