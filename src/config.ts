export const CONFIG: ConfigType = {
    refreshTime: 60000,
    selectors: {
        price: 'div.product-page-pricing p.product-new-price',
        stock: 'div.product-page-pricing span.label',
        name: 'div.page-header h1.page-title'
    },
    unknownStock: 'UnknownStock',
    unknownName: 'Unknown Name',
    logLocation: 'D:\\project\\logger',
    database: {
        host: 'localhost',
        user: 'root',
        password: 'test',
        database: 'emag_crawler',
        multipleStatements: true
    },
    SMTPServer: {
        host: 'test',
        port: 465,
        secure: true,
        auth: {
            user: 'test',
            pass: 'test'
        }
    },
    productsUrls: [
        'https://www.emag.ro/multifunctional-inkjet-color-canon-pixma-ts3150-wifi-a4-negru-2226c006aa/pd/D5J2S0BBM/',
        'https://www.emag.ro/memorie-hyperx-predator-16gb-ddr4-3200mhz-cl16-hx432c16pb3-16/pd/DGMH94BBM/',
        'https://www.emag.ro/hdd-wd-blue-1tb-7200rpm-64mb-cache-sata-iii-wd10ezex/pd/E8G7KBBBM/',
        'https://www.emag.ro/telefon-mobil-apple-iphone-7-128gb-jet-black-mn962rm-a/pd/DSDVF2BBM/'
    ]
};

interface ConfigType {
    refreshTime: number;
    selectors: {
        price: string;
        stock: string;
        name: string
    };
    unknownStock: string;
    unknownName: string;
    logLocation: string;
    database: {
        host: string;
        user: string;
        password: string;
        database: string;
        multipleStatements: boolean;
    };
    SMTPServer: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        }
    };
    productsUrls: string[];
}

export interface ProductInfo {
    url: string;
    price: number;
    stock: string;
}
