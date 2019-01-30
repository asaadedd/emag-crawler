import { ProductUpdater } from './products/productUpdater';
import { Logger } from './logger';
import { Database } from './database/database';
import { MailSender } from './mail/mailSender';

const logger = new Logger();
const database = new Database(logger);
const mailSender = new MailSender(logger);
const productUpdater = new ProductUpdater(mailSender, database, logger);

database.initialize().then(() => {
    productUpdater.startWatching();
});
