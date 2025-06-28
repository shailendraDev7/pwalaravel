export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Banner {
  id: number;
  name: string;
  image_url: string;
}

export interface Vendor {
  id: number;
  name: string;
  avatar: string;
}

export const categories: Category[] = [
  { id: 1, name: "Men", slug: "men" },
  { id: 2, name: "Women", slug: "women" },
  { id: 3, name: "Accessories", slug: "accessories" },
];

export const banners: Banner[] = [
  { id: 1, name: "Hot Sales", image_url: "/images/slider1.jpg", },
  { id: 2, name: "New Arrivals", image_url: "/images/slider2.jpg", },  
];

export const vendors: Vendor[] = [
    { id: 1, name: 'Goldstar', avatar: '/images/goldstar.png' },
    { id: 2, name: 'Yolo', avatar: '/images/yolo.png' },
  ];