"use client";

import { useTranslations } from "next-intl";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import { AnalyticsResponse } from "../../types/admin";

// ─── Helpers ────────────────────────────────────────────────────────────────

const toNum = (v: string | number | undefined): number => {
  if (v === undefined) return 0;
  if (typeof v === "number") return v;
  return parseFloat(v) || 0;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#fbbf24",
  PENDING_PAYMENT: "#fbbf24",
  PAID: "#22c55e",
  COMPLETED: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
  REVIEWING: "#3b82f6",
  RESOLVED: "#22c55e",
  REFERRED: "#a855f7",
  ACTIVE: "#22c55e",
};

const CATEGORY_COLORS = [
  "#3b82f6", "#22c55e", "#fbbf24", "#ef4444", "#a855f7",
  "#06b6d4", "#f97316", "#ec4899", "#84cc16", "#6366f1",
];

const getColor = (key: string, idx: number): string =>
  STATUS_COLORS[key] ?? CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

// ─── Revenue Line Chart ─────────────────────────────────────────────────────

export function RevenueLineChart({ data }: { data: AnalyticsResponse["revenueByMonth"] }) {
  const t = useTranslations("Charts");
  const chartData = data.map((d) => ({
    month: d.month,
    revenue: toNum(d.revenue),
    transactions: d.transaction_count,
  }));

  if (chartData.length === 0) {
    return <EmptyChart label={t("noRevenueData")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--bc) / 0.5)" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--bc) / 0.5)" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, t("revenue")]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Transaction Status Donut ───────────────────────────────────────────────

export function TransactionStatusPie({ data }: { data: AnalyticsResponse["transactionStatus"] }) {
  const t = useTranslations("Charts");
  const chartData = data.map((d) => ({
    name: d.status,
    value: d.count,
    amount: toNum(d.total_amount),
  }));

  if (chartData.length === 0) {
    return <EmptyChart label={t("noTransactions")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, idx) => (
            <Cell key={entry.name} fill={getColor(entry.name, idx)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number, _name: string, props: { payload?: { amount?: number } }) => [
            `${value} txns ($${(props?.payload?.amount ?? 0).toFixed(2)})`,
            props?.payload?.name ?? "",
          ]}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Installment Status Bar ─────────────────────────────────────────────────

export function InstallmentStatusBar({ data }: { data: AnalyticsResponse["installmentStatus"] }) {
  const t = useTranslations("Charts");
  const chartData = data.map((d) => ({
    status: d.status,
    count: d.count,
    amount: toNum(d.total_amount),
  }));

  if (chartData.length === 0) {
    return <EmptyChart label={t("noInstallments")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
        <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(var(--bc) / 0.5)" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--bc) / 0.5)" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number, name: string) => {
            if (name === "count") return [value, t("installments")];
            return [`$${value.toFixed(2)}`, t("amount")];
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={entry.status} fill={getColor(entry.status, idx)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Top Merchants Horizontal Bar ───────────────────────────────────────────

export function TopMerchantsChart({ data }: { data: AnalyticsResponse["topMerchants"] }) {
  const t = useTranslations("Charts");
  const chartData = data.map((d) => ({
    name: d.merchant_name,
    revenue: toNum(d.revenue),
    transactions: d.transaction_count,
    category: d.category,
  }));

  if (chartData.length === 0) {
    return <EmptyChart label={t("noMerchants")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--bc) / 0.5)" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--bc) / 0.5)"
          width={120}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, t("revenue")]}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Merchant Category Donut ────────────────────────────────────────────────

export function CategoryDonut({ data }: { data: AnalyticsResponse["categoryDistribution"] }) {
  const t = useTranslations("Charts");
  const chartData = data.map((d) => ({
    name: d.category,
    value: d.merchant_count,
  }));

  if (chartData.length === 0) {
    return <EmptyChart label={t("noCategories")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }: { name?: string; value?: number }) =>
            `${name}: ${value}`
          }
          labelLine={false}
          style={{ fontSize: "11px" }}
        >
          {chartData.map((entry, idx) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Triage Funnel ──────────────────────────────────────────────────────────

export function TriageFunnel({ data }: { data: AnalyticsResponse["triageConversion"] }) {
  const t = useTranslations("Charts");
  const chartData = [
    { stage: t("stagePending"), count: data.pending_count, fill: "#fbbf24" },
    { stage: t("stageReviewing"), count: data.reviewing_count, fill: "#3b82f6" },
    { stage: t("stageResolved"), count: data.resolved_count, fill: "#22c55e" },
    { stage: t("stageReferred"), count: data.referred_count, fill: "#a855f7" },
    { stage: t("stageCompleted"), count: data.completed_count, fill: "#06b6d4" },
  ].filter((d) => d.count > 0);

  if (chartData.length === 0) {
    return <EmptyChart label={t("noTriages")} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="hsl(var(--bc) / 0.5)" />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--bc) / 0.5)" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--b1))",
            border: "1px solid hsl(var(--bc) / 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value: number) => [value, t("triages")]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[280px] text-sm opacity-40">
      {label}
    </div>
  );
}
