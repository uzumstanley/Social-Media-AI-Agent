import fs from 'fs';
import request from 'request';
import logger from '../config/logger';

export const download = function (uri: string, filename: string, callback: (err?: Error) => void): void {
    request.head(uri, function (err: Error | null, _res: request.Response, _body: any) {
        if (err) {
            logger.error(`Error fetching headers for ${uri}: ${err.message}`);
            callback(err);
            return;
        }
        request(uri)
            .pipe(fs.createWriteStream(filename))
            .on('error', (err: Error) => {
                logger.error(`Error downloading file from ${uri}: ${err.message}`);
                callback(err);
            })
            .on('close', () => {
                logger.info(`File downloaded successfully from ${uri} to ${filename}`);
                callback();
            });
    });
};




