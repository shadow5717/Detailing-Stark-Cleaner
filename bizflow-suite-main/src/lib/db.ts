// IndexedDB Database Service for STAR Business Management System

const DB_NAME = 'star_business_db';
const DB_VERSION = 1;

export const STORES = {
  APPOINTMENTS: 'appointments',
  PRODUCTS: 'products',
  VEHICLES: 'vehicles',
  COMPLETED_VEHICLES: 'completed_vehicles',
  SALES: 'sales',
  USERS: 'users',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Appointments store (Barbería)
      if (!database.objectStoreNames.contains(STORES.APPOINTMENTS)) {
        const appointmentStore = database.createObjectStore(STORES.APPOINTMENTS, { keyPath: 'id', autoIncrement: true });
        appointmentStore.createIndex('fecha', 'fecha', { unique: false });
        appointmentStore.createIndex('cliente', 'cliente', { unique: false });
        appointmentStore.createIndex('barbero', 'barbero', { unique: false });
      }

      // Products store (Billar/POS)
      if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productStore = database.createObjectStore(STORES.PRODUCTS, { keyPath: 'id', autoIncrement: true });
        productStore.createIndex('codigo', 'codigo', { unique: true });
        productStore.createIndex('categoria', 'categoria', { unique: false });
        productStore.createIndex('nombre', 'nombre', { unique: false });
      }

      // Vehicles store (Car Wash - en proceso)
      if (!database.objectStoreNames.contains(STORES.VEHICLES)) {
        const vehicleStore = database.createObjectStore(STORES.VEHICLES, { keyPath: 'id', autoIncrement: true });
        vehicleStore.createIndex('placa', 'placa', { unique: false });
        vehicleStore.createIndex('estado', 'estado', { unique: false });
      }

      // Completed Vehicles store (Car Wash - entregados)
      if (!database.objectStoreNames.contains(STORES.COMPLETED_VEHICLES)) {
        const completedStore = database.createObjectStore(STORES.COMPLETED_VEHICLES, { keyPath: 'id', autoIncrement: true });
        completedStore.createIndex('placa', 'placa', { unique: false });
        completedStore.createIndex('fecha', 'fecha', { unique: false });
      }

      // Sales store
      if (!database.objectStoreNames.contains(STORES.SALES)) {
        const salesStore = database.createObjectStore(STORES.SALES, { keyPath: 'id', autoIncrement: true });
        salesStore.createIndex('fecha', 'fecha', { unique: false });
        salesStore.createIndex('metodo_pago', 'metodo_pago', { unique: false });
      }

      // Users store
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        const usersStore = database.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('usuario', 'usuario', { unique: true });
        usersStore.createIndex('rol', 'rol', { unique: false });
      }
    };
  });
};

export const addData = async <T extends object>(storeName: StoreName, data: T): Promise<number> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getAllData = async <T>(storeName: StoreName): Promise<T[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

export const getDataById = async <T>(storeName: StoreName, id: number): Promise<T | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
};

export const updateData = async <T extends { id: number }>(storeName: StoreName, data: T): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteData = async (storeName: StoreName, id: number): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearStore = async (storeName: StoreName): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Backup and restore functions
export const exportDatabase = async (): Promise<string> => {
  const data: Record<string, unknown[]> = {};
  
  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAllData(storeName);
  }
  
  return JSON.stringify(data, null, 2);
};

export const importDatabase = async (jsonData: string): Promise<void> => {
  const data = JSON.parse(jsonData);
  
  for (const [storeName, records] of Object.entries(data)) {
    await clearStore(storeName as StoreName);
    for (const record of records as object[]) {
      await addData(storeName as StoreName, record);
    }
  }
};

// Initialize with sample data if empty
export const initializeSampleData = async () => {
  const products = await getAllData<Product>(STORES.PRODUCTS);
  
  if (products.length === 0) {
    const sampleProducts: Omit<Product, 'id'>[] = [
      { codigo: 'P001', nombre: 'Cerveza Nacional', categoria: 'Bebidas', precio_compra: 50, precio_venta: 80, stock: 48 },
      { codigo: 'P002', nombre: 'Refresco Cola', categoria: 'Bebidas', precio_compra: 25, precio_venta: 45, stock: 36 },
      { codigo: 'P003', nombre: 'Agua Mineral', categoria: 'Bebidas', precio_compra: 15, precio_venta: 30, stock: 60 },
      { codigo: 'P004', nombre: 'Papitas', categoria: 'Snacks', precio_compra: 20, precio_venta: 40, stock: 24 },
      { codigo: 'P005', nombre: 'Nachos', categoria: 'Snacks', precio_compra: 35, precio_venta: 60, stock: 18 },
      { codigo: 'P006', nombre: 'Hora de Billar', categoria: 'Servicios', precio_compra: 0, precio_venta: 150, stock: 999 },
    ];
    
    for (const product of sampleProducts) {
      await addData(STORES.PRODUCTS, product);
    }
  }
};

// Type definitions
export interface Appointment {
  id: number;
  cliente: string;
  telefono: string;
  barbero: string;
  servicio: string;
  precio: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
}

export interface Vehicle {
  id: number;
  placa: string;
  tipo: 'Carro' | 'Jeepeta' | 'Motor' | 'Camión';
  servicio: string;
  precio: number;
  empleado: string;
  estado: 'en_proceso' | 'completado';
  hora_entrada: string;
  fecha: string;
  notas?: string;
}

export interface CompletedVehicle extends Vehicle {
  hora_salida: string;
}

export interface Sale {
  id: number;
  productos: Array<{
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  subtotal: number;
  impuesto: number;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  fecha: string;
  hora: string;
}

export interface User {
  id: number;
  nombre: string;
  usuario: string;
  password: string;
  rol: 'admin' | 'cajero_billar' | 'barbero' | 'lavador';
  activo: boolean;
  fecha_creacion: string;
}
