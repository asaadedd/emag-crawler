import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { compile } from 'handlebars';
import { CONFIG } from '../config';
import { UpdatedProduct } from '../products/productUpdater';
import { Logger } from '../logger';
import productsUpdateEmailHtml from './productsUpdateEmail.html';

export class MailSender {
    private readonly transporter: Transporter;

    constructor(private logger: Logger) {
        this.transporter = createTransport(CONFIG.SMTPServer);
    }

    public async sentChangeEmail(products: UpdatedProduct[]) {
        try {
            const sendMailTemplate = compile(productsUpdateEmailHtml);
            const changedProductHtml = sendMailTemplate({ products });
            const mailOption: SendMailOptions = {
                from: '"Emag Crawler Updated" <emag.crawler.updated@emag-crawler.com>',
                to: 'saadeddineadnan@gmail.com',
                subject: 'Emag products updated',
                html: changedProductHtml
            };

            await this.transporter.sendMail(mailOption);
            this.logger.info('Update products email send successfully');
        } catch (error) {
            this.logger.error('Error in sending update email', error);
        }
    }
}
