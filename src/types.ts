import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  growth: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export interface SidebarItem {
  icon: React.ForwardRefExoticComponent<any>;
  label: string;
  id: string;
}

export interface ChartData {
  name: string;
  value: number;
  actual: number;
}
