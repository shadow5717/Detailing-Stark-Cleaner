import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CircleDot,
  Plus,
  ShoppingCart,
  Package,
  BarChart3,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building,
  Search,
} from 'lucide-react';
import {
  addData,
  getAllData,
  deleteData,
  updateData,
  STORES,
  type Product,
  type Sale,
} from '@/lib/db';
import { toast } from 'sonner';

interface CartItem extends Product {
  cantidad: number;
}

export function BillarModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Bebidas',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
  });

  const loadData = async () => {
    const productsData = await getAllData<Product>(STORES.PRODUCTS);
    const salesData = await getAllData<Sale>(STORES.SALES);
    setProducts(productsData);
    setSales(salesData.sort((a, b) => b.id - a.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.cantidad >= product.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.cantidad + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) {
          toast.error('Stock insuficiente');
          return item;
        }
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const subtotal = getCartTotal();
    const impuesto = subtotal * 0.18;
    const total = subtotal + impuesto;

    const sale: Omit<Sale, 'id'> = {
      productos: cart.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio_venta,
      })),
      subtotal,
      impuesto,
      total,
      metodo_pago: paymentMethod,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
    };

    // Update stock
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await updateData(STORES.PRODUCTS, {
          ...product,
          stock: product.stock - item.cantidad,
        });
      }
    }

    await addData(STORES.SALES, sale);
    toast.success(`Venta procesada: RD$${total.toFixed(2)}`);
    setCart([]);
    loadData();
  };

  const handleAddProduct = async () => {
    if (!newProduct.codigo || !newProduct.nombre) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    await addData(STORES.PRODUCTS, newProduct);
    toast.success('Producto agregado');
    setNewProduct({
      codigo: '',
      nombre: '',
      categoria: 'Bebidas',
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
    });
    setIsAddProductOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: number) => {
    await deleteData(STORES.PRODUCTS, id);
    toast.success('Producto eliminado');
    loadData();
  };

  const filteredProducts = products.filter(
    p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySales = sales.filter(s => s.fecha === new Date().toISOString().split('T')[0]);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-success/20">
          <CircleDot className="w-6 h-6 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Billar - Punto de Venta</h1>
          <p className="text-muted-foreground">Gestión de inventario y ventas</p>
        </div>
      </div>

      <Tabs defaultValue="pos" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="pos" className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Punto de Venta
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="w-4 h-4" /> Inventario
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Ventas del Día
            {todaySales.length > 0 && (
              <Badge className="ml-1 bg-success">{todaySales.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* POS Tab */}
        <TabsContent value="pos" className="animate-slide-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 glass rounded-xl p-6 space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {product.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.categoria}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        RD${product.precio_venta}
                      </span>
                      <Badge
                        variant={product.stock > 10 ? 'outline' : 'destructive'}
                        className="text-xs"
                      >
                        {product.stock}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Carrito
              </h3>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            RD${item.precio_venta} x {item.cantidad}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.cantidad}
                          </span>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>RD${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ITBIS (18%)</span>
                      <span>RD${(getCartTotal() * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        RD${(getCartTotal() * 1.18).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <div className="flex gap-2">
                        {[
                          { value: 'efectivo', icon: Banknote, label: 'Efectivo' },
                          { value: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
                          { value: 'transferencia', icon: Building, label: 'Transfer' },
                        ].map(({ value, icon: Icon, label }) => (
                          <Button
                            key={value}
                            variant={paymentMethod === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaymentMethod(value as typeof paymentMethod)}
                            className="flex-1 gap-1"
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      size="lg"
                      onClick={processSale}
                    >
                      Procesar Venta
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Carrito vacío</p>
                  <p className="text-sm">Seleccione productos para agregar</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Agregar Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Código</Label>
                        <Input
                          value={newProduct.codigo}
                          onChange={(e) => setNewProduct({ ...newProduct, codigo: e.target.value })}
                          placeholder="P001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={newProduct.nombre}
                          onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                          placeholder="Nombre del producto"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        value={newProduct.categoria}
                        onValueChange={(value) => setNewProduct({ ...newProduct, categoria: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bebidas">Bebidas</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Servicios">Servicios</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Precio Compra</Label>
                        <Input
                          type="number"
                          value={newProduct.precio_compra}
                          onChange={(e) => setNewProduct({ ...newProduct, precio_compra: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio Venta</Label>
                        <Input
                          type="number"
                          value={newProduct.precio_venta}
                          onChange={(e) => setNewProduct({ ...newProduct, precio_venta: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">
                      Guardar Producto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>P. Compra</TableHead>
                    <TableHead>P. Venta</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">{product.codigo}</TableCell>
                      <TableCell className="font-medium">{product.nombre}</TableCell>
                      <TableCell>{product.categoria}</TableCell>
                      <TableCell>RD${product.precio_compra}</TableCell>
                      <TableCell>RD${product.precio_venta}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? 'outline' : 'destructive'}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="animate-slide-in-up">
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ventas de Hoy</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total del día</p>
                <p className="text-2xl font-bold text-success">
                  RD${todayTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.id}</TableCell>
                      <TableCell>{sale.hora}</TableCell>
                      <TableCell>
                        {sale.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {sale.metodo_pago}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        RD${sale.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
