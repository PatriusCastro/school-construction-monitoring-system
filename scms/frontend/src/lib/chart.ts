import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  ChartOptions,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Tooltip, Legend);

export const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
  },
};

export const pieOptions: ChartOptions<"pie"> = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
  },
};
