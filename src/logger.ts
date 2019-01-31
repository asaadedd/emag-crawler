import fs from 'fs';
import { CONFIG } from './config';
import { isUndefined } from 'lodash';
import momentJs from 'moment';

export class Logger {
    private static readonly MAXIMUM_NUMBER_OF_LINES: number = 1000;
    private static readonly MAXIMUM_WRITE_RETRY: number = 2;
    private static readonly FILE_NAME: string = 'emag_crawler_info';
    private numberOfLines: number;
    private currentFileName: string;

    constructor(private fileSystem = fs, private moment = momentJs) {
        this.numberOfLines = 0;
        this.createNewFileIfNeeded();
    }

    public info(loggingString: string) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(this.getInfoString(loggingString), 0);
        }
    }

    public error(loggingString: string, error: Error) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(this.getErrorString(loggingString, error), 0);
        }
    }

    public warn(loggingString: string) {
        this.createNewFileIfNeeded();
        if (this.currentFileName) {
            this.writeInFile(this.getWarnString(loggingString), 0);
        }
    }

    private writeInFile(stringToWrite: string, retryNumber: number) {
        if (this.currentFileName) {
            const filePath = `${CONFIG.logLocation}/${this.currentFileName}`;
            try {
                this.fileSystem.appendFileSync(filePath, `${stringToWrite}\n`);
            } catch (error) {
                if (retryNumber < Logger.MAXIMUM_WRITE_RETRY) {
                    this.writeInFile(stringToWrite, retryNumber + 1);
                }
            }
        }
    }

    private createNewFileIfNeeded() {
        if (this.numberOfLines >= Logger.MAXIMUM_NUMBER_OF_LINES || !this.currentFileName) {
            const latestFileNumber = this.getLatestLogFileNumber();
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
            this.fileSystem.writeFileSync(`${CONFIG.logLocation}/${Logger.FILE_NAME}_${fileNumber}.txt`, '');
            this.currentFileName = `${Logger.FILE_NAME}_${fileNumber}.txt`;
        } catch (error) {}
    }

    private getLatestLogFileNumber(): number {
        const allFiles: string[] = this.fileSystem.readdirSync(CONFIG.logLocation);
        const fileNumbers: number[] = allFiles.map((fileName: string) =>
            parseInt(Logger.getFileNumber(fileName), 10)
        );

        fileNumbers.sort((firstNumber, secondNumber) => firstNumber - secondNumber);

        return fileNumbers[fileNumbers.length - 1];
    }

    private getInfoString(infoString: string): string {
        return `${this.moment().format('DD/MM/YYYY HH:mm')} INFO : ${infoString}`;
    }

    private getErrorString(errorString: string, error: Error): string {
        return `${this.moment().format('DD/MM/YYYY HH:mm')} ERROR : ${errorString} ${error.message}`;
    }

    private getWarnString(infoString: string): string {
        return `${this.moment().format('DD/MM/YYYY HH:mm')} WARNING : ${infoString}`;
    }

    private static getFileNumber(fileName: string) {
        const getNumberExpression = new RegExp(`${Logger.FILE_NAME}_(.*).txt`, 'g');
        const result = getNumberExpression.exec(fileName);

        return result && result.length && result[1];
    }
}
