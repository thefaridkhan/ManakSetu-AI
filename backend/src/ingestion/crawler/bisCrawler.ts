import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../../config/logger.js';

export interface RawCrawledStandard {
  docIdentifier: string;
  title: string;
  category: string;
  isMandatoryQCO: boolean;
  qcoNotification?: string;
  effectiveDate?: string;
  content: string;
  sourceUrl: string;
}

export class BISCrawler {
  private readonly userAgent = 'BIS-Intelligent-Assistant-Bot/1.0 (Government Standards Retrieval Bot; +https://www.services.bis.gov.in)';

  /**
   * Crawls permitted BIS public catalogues or gazette pages
   */
  async fetchPermittedSource(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/json'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      logger.warn(`Could not reach live BIS source URL (${url}), using local permitted archive.`, { error: error.message });
      return '';
    }
  }

  /**
   * Parses HTML/JSON content into structured standard representations
   */
  parsePublicCatalogueHtml(html: string, sourceUrl: string): RawCrawledStandard[] {
    if (!html) return [];
    const $ = cheerio.load(html);
    const results: RawCrawledStandard[] = [];

    // Extract table rows if available
    $('table tr').each((_, elem) => {
      const isNum = $(elem).find('td:nth-child(1)').text().trim();
      const title = $(elem).find('td:nth-child(2)').text().trim();
      const category = $(elem).find('td:nth-child(3)').text().trim() || 'General';

      if (isNum.startsWith('IS') && title) {
        results.push({
          docIdentifier: isNum,
          title,
          category,
          isMandatoryQCO: false,
          content: `${title}. Full specification for ${isNum}. Sector: ${category}.`,
          sourceUrl
        });
      }
    });

    return results;
  }
}

export const bisCrawler = new BISCrawler();
