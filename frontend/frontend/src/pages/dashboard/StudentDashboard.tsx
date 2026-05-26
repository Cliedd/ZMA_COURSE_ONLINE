import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Lun', hours: 2 },
  { day: 'Mar', hours: 3 },
  { day: 'Mer', hours: 1 },
  { day: 'Jeu', hours: 4 },
  { day: 'Ven', hours: 2 },
  { day: 'Sam', hours: 5 },
  { day: 'Dim', hours: 3 },
];

export const StudentDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Tableau de Bord Étudiant</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader><CardTitle>Temps d'apprentissage</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">12h cette semaine</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Streak actuel</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold text-secondary">5 jours 🔥</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Certificats obtenus</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">2</p></CardContent>
      </Card>
    </div>
    <Card className="p-6">
      <h3 className="font-bold mb-4">Progression Hebdomadaire</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#1A3C6E" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </div>
);
