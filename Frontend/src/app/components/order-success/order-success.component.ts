import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss'],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('700ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OrderSuccessComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  orderData: { id: string | number; total: number } | null = null;
  today: string = '';

  private animFrame: number = 0;
  private particles: Particle[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Dátum formázás
    this.today = new Date().toLocaleDateString('hu-HU', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Rendelés adatai – Router state-ből vagy localStorage-ból
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { order?: any } | undefined;

    if (state?.order) {
      this.orderData = state.order;
    } else {
      // Fallback: localStorage (ha checkout eltárolta)
      const saved = localStorage.getItem('lastOrder');
      if (saved) {
        this.orderData = JSON.parse(saved);
        localStorage.removeItem('lastOrder');
      }
    }
  }

  ngAfterViewInit(): void {
    this.initParticles();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrame);
  }

  // ── Gold particle effect ──────────────────────
  private initParticles(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Particle init
    this.particles = Array.from({ length: 55 }, () => this.newParticle(W, H));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of this.particles) {
        p.y -= p.vy;
        p.x += p.vx;
        p.life -= 0.004;
        p.r  += 0.003;

        if (p.life <= 0) Object.assign(p, this.newParticle(W, H));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.life * 0.35})`;
        ctx.fill();
      }
      this.animFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  private newParticle(W: number, H: number): Particle {
    return {
      x:    Math.random() * W,
      y:    H + Math.random() * 100,
      r:    Math.random() * 1.5 + 0.3,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   Math.random() * 0.4 + 0.15,
      life: Math.random() * 0.6 + 0.4,
    };
  }
}

interface Particle {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  life: number;
}