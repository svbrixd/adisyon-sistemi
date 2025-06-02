export interface MenuItemType {
  id: number;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'breakfast' | 'soup';
}

export interface OrderItem {
  menuItem: MenuItemType;
  quantity: number;
} 