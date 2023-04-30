import {MenuItem} from 'primeng/api';

export interface MenuItemWithCode extends MenuItem {
  code?: string;
}
