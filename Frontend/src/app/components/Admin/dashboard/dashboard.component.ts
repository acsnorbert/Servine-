import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

import { UserService } from '../../../services/user.service';
import { OrderService } from '../../../services/order.service';
import { OrderItemsService } from '../../../services/order-items.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { MessageService } from '../../../services/message.service';

import { User } from '../../../interfaces/user';
import { Order } from '../../../interfaces/order';
import { Order_item } from '../../../interfaces/order_items';
import { Product } from '../../../interfaces/product';
import { Category } from '../../../interfaces/category';
import { Revenue } from '../../../interfaces/revenue';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ChartModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  constructor(
    private UserApi: UserService,
    private OrderApi: OrderService,
    private OrderItemsApi: OrderItemsService,
    private productApi: ProductService,
    private categoryApi: CategoryService,
    private messageService: MessageService
  ) {}

  users: User[] = [];
  orders: Order[] = [];
  order_items: Order_item[] = [];
  products: Product[] = [];
  category: Category[] = [];
  revenue: Revenue[] = [];

  // ===== STATS =====
  currentRevenue: number = 0;
  growth: number = 0;

  // ===== LISTÁK =====
  latestUsers: User[] = [];
  recentActivity: any[] = [];

  // ===== CHART =====
  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.initChartOptions();

    this.getUsers();
    this.getOrders();
    this.getOrderitems();
    this.getProducts();
    this.getCategories();
    this.getRevenue();
  }

  // ================= USERS =================
  getUsers() {
    this.UserApi.GetUsers().subscribe({
      next: (res) => {
        this.users = res as User[];
        this.calculateLatestUsers();
        this.calculateRecentActivity();
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a felhasználók lehívásakor');
      }
    });
  }

  // ================= ORDERS =================
  getOrders() {
    this.OrderApi.getOrders().subscribe({
      next: (res) => {
        this.orders = res as Order[];
        this.calculateRecentActivity();
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelések lehívásakor');
      }
    });
  }

  // ================= REVENUE =================
  getRevenue() {
    this.OrderApi.GetRevenue().subscribe({
      next: (res) => {
        this.revenue = res as Revenue[];
        this.calculateCurrentRevenue();
        this.calculateGrowth();
        this.updateChart();
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a revenue lekérésekor');
      }
    });
  }

  // ================= ORDER ITEMS =================
  getOrderitems() {
    this.OrderItemsApi.getOrderItems().subscribe({
      next: (res) => {
        this.order_items = res as Order_item[];
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelési tételek lehívásakor');
      }
    });
  }

  // ================= PRODUCTS =================
  getProducts() {
    this.productApi.getProducts().subscribe({
      next: (res) => {
        this.products = res as Product[];
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a termékek lehívásakor');
      }
    });
  }

  // ================= CATEGORIES =================
  getCategories() {
    this.categoryApi.getCategories().subscribe({
      next: (res) => {
        this.category = res as Category[];
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a kategóriák lehívásakor');
      }
    });
  }

  // ================= CALCULATIONS =================

  // Aktuális havi revenue
  calculateCurrentRevenue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const current = this.revenue.find(r => r.year == year && r.month == month);
    this.currentRevenue = current ? current.total : 0;
  }

  // Growth (előző hónaphoz képest)
  calculateGrowth() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    let prevMonth = month - 1;
    let prevYear = year;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    const current = this.revenue.find(r => r.year == year && r.month == month);
    const prev = this.revenue.find(r => r.year == prevYear && r.month == prevMonth);

    if (current && prev && prev.total > 0) {
      this.growth = ((current.total - prev.total) / prev.total) * 100;
    } else {
      this.growth = 0;
    }
  }

  // Chart adat
  updateChart() {
    const labels = this.revenue.map(r => `${r.year}-${r.month}`);
    const data = this.revenue.map(r => r.total);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          borderColor: '#d4a84f',
          backgroundColor: 'rgba(212,168,79,0.2)',
          tension: 0.4
        }
      ]
    };
  }

  initChartOptions() {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#ccc'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#aaa' },
          grid: { color: '#222' }
        },
        y: {
          ticks: { color: '#aaa' },
          grid: { color: '#222' }
        }
      }
    };
  }

  // ===== Latest Users =====
  calculateLatestUsers() {
    this.latestUsers = [...this.users]
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 6);
  }

  // ===== Recent Activity =====
  calculateRecentActivity() {
    const activities = [
      ...this.orders.map(o => ({
        date: o.updatedAt ?? 0,
        text: `Order #${o.id} frissítve`
      })),
      ...this.users.map(u => ({
        date: u.updatedAt ?? 0,
        text: `Új user: ${u.name}`
      }))
    ];

    this.recentActivity = activities
      .sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 6);
  }
}

