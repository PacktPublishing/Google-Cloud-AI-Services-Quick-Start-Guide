import { $$, browser } from 'protractor';

export class SmartExchangePackage {
  navigateTo() {
    return browser.get('/');
  }

  getNavbarElement(n) {
    return $$('app-root a').get(n).getText();
  }

  getNavbarButton() {
    return $$('app-root button').get(0).getText();
  }

}
