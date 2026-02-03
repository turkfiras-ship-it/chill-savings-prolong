import { showroomsData, totalYearlySavings25, totalYearlySavings30 } from "@/data/savingsData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ShowroomTable() {
  const formatNumber = (num: number) => num.toLocaleString('en-US');
  const formatCurrency = (num: number) => `${num.toLocaleString('en-US')} SAR`;

  return (
    <div className="rounded-xl bg-card card-elevated overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold">Showroom Breakdown</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Individual savings analysis per location
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Showroom</TableHead>
              <TableHead className="font-semibold">AC Units</TableHead>
              <TableHead className="text-right font-semibold">Consumption (KWh/yr)</TableHead>
              <TableHead className="text-right font-semibold">Savings 25%</TableHead>
              <TableHead className="text-right font-semibold">Savings 30%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showroomsData.map((showroom, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{showroom.name}</TableCell>
                <TableCell className="text-muted-foreground">{showroom.units}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(showroom.totalConsumption)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-medium">
                  {formatCurrency(showroom.yearlySavings25)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-savings font-semibold">
                  {formatCurrency(showroom.yearlySavings30)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/70 font-bold border-t-2">
              <TableCell>Total (20 Showrooms)</TableCell>
              <TableCell>164 Units</TableCell>
              <TableCell className="text-right tabular-nums">14,180,621</TableCell>
              <TableCell className="text-right tabular-nums text-savings">
                {formatCurrency(totalYearlySavings25)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-savings">
                {formatCurrency(totalYearlySavings30)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
