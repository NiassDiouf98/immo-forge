import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-proprietaire',
  imports: [ CommonModule, MatIconModule ],
  templateUrl: './dashboard-proprietaire.html',
  styleUrl: './dashboard-proprietaire.css',
})
export class DashboardProprietaire implements OnInit {
  stats = {
    totalProperties: 24,
    activeListings: 18,
    pendingBookings: 3,
    revenueThisMonth: 4_500_000
  };

  // mock timeseries for chart
  chartSeries = [
    { name: 'Visites', data: [40, 55, 70, 60, 80, 95, 120] }
  ];

  ngOnInit(){ }

}
