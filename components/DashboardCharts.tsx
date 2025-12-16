import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, ComposedChart, Line, Legend, Area, AreaChart
} from 'recharts';
import { useStore } from '../context/AppStore';
import { CourseType, UserRole } from '../types';
import { BookOpen, Users, Award, TrendingUp, Filter, AlertCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { EVALUATION_SCHEMAS } from '../constants';

// --- Custom Tooltip Component ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100">
                <p className="font-bold text-gray-800 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
                        />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-bold text-gray-900">
                            {typeof entry.value === 'number'
                                ? (['Aprovados', 'Reprovados', 'Desligados', 'Turmas', 'Atualização', 'Exercício Fogo', 'Horas Aula'].includes(entry.name)
                                    ? entry.value
                                    : entry.value.toFixed(2))
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomBarLabel = (props: any) => {
    const { x, y, width, value, fill } = props;
    if (value === null || value === undefined) return null;
    return (
        <text
            x={x + width / 2}
            y={y - 5}
            fill={fill}
            textAnchor="middle"
            dominantBaseline="bottom"
            fontSize={12}
            fontWeight="bold"
        >
            {Number(value).toFixed(2)}
        </text>
    );
};

// --- Firefighter Status Chart ---
export const FirefighterStatusChart: React.FC = () => {
    const { firefighters } = useStore();
    const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
    const [baseFilter, setBaseFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'month' | 'base'>('month');

    // Get unique bases for filter
    const bases = useMemo(() => {
        const uniqueBases = new Set(firefighters.map(f => f.base).filter(Boolean));
        return Array.from(uniqueBases).sort();
    }, [firefighters]);

    const data = useMemo(() => {
        // Use real data if available, otherwise use rich mock data





        let filteredFirefighters = firefighters;
        if (baseFilter !== 'all') {
            filteredFirefighters = firefighters.filter(f => f.base === baseFilter);
        }

        if (viewMode === 'month') {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const stats = months.map(m => ({ name: m, updates: 0, exercises: 0 }));

            filteredFirefighters.forEach(ff => {
                if (ff.lastUpdateDate) {
                    const date = new Date(ff.lastUpdateDate);
                    const expDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    if (expDate.getFullYear().toString() === yearFilter) {
                        stats[expDate.getMonth()].updates++;
                    }
                }
                if (ff.lastFireExerciseDate) {
                    const date = new Date(ff.lastFireExerciseDate);
                    const expDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    if (expDate.getFullYear().toString() === yearFilter) {
                        stats[expDate.getMonth()].exercises++;
                    }
                }
            });
            return stats;
        } else {
            // Group by Base
            const baseStats = new Map<string, { updates: number; exercises: number }>();

            filteredFirefighters.forEach(ff => {
                const base = ff.base || 'Sem Base';
                if (!baseStats.has(base)) baseStats.set(base, { updates: 0, exercises: 0 });
                const stats = baseStats.get(base)!;

                if (ff.lastUpdateDate) {
                    const date = new Date(ff.lastUpdateDate);
                    const expDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    if (expDate.getFullYear().toString() === yearFilter) {
                        stats.updates++;
                    }
                }
                if (ff.lastFireExerciseDate) {
                    const date = new Date(ff.lastFireExerciseDate);
                    const expDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    if (expDate.getFullYear().toString() === yearFilter) {
                        stats.exercises++;
                    }
                }
            });

            return Array.from(baseStats.entries()).map(([name, stats]) => ({
                name,
                updates: stats.updates,
                exercises: stats.exercises
            })).sort((a, b) => (b.updates + b.exercises) - (a.updates + a.exercises));
        }
    }, [firefighters, yearFilter, viewMode, baseFilter]);

    return (
        <div className="card-premium p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={20} />
                        Vencimentos Bombeiros
                    </h3>
                    <p className="text-sm text-gray-500">Atualizações e Exercícios com Fogo a Vencer</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="input-field py-1.5 text-sm w-24"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                    <select
                        value={baseFilter}
                        onChange={(e) => setBaseFilter(e.target.value)}
                        className="input-field py-1.5 text-sm w-32"
                    >
                        <option value="all">Todas Bases</option>
                        {bases.map(base => (
                            <option key={base} value={base}>{base}</option>
                        ))}
                    </select>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as any)}
                        className="input-field py-1.5 text-sm w-32"
                    >
                        <option value="month">Por Mês</option>
                        <option value="base">Por Base</option>
                    </select>
                </div>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorExercises" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Legend />
                        <Bar dataKey="updates" name="Atualização" fill="url(#colorUpdates)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                        <Bar dataKey="exercises" name="Exercício Fogo" fill="url(#colorExercises)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Graduated Students Chart ---
export const GraduatedStudentsChart: React.FC = () => {
    const { classes, students, courses } = useStore();
    const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
    const [classFilter, setClassFilter] = useState<string>('all');

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setYearFilter(e.target.value);
        setClassFilter('all');
    };

    const availableClasses = useMemo(() => {
        return classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );
    }, [classes, yearFilter]);

    const data = useMemo(() => {
        let relevantClasses = classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );

        if (classFilter !== 'all') {
            relevantClasses = relevantClasses.filter(c => c.id === classFilter);
        }

        const relevantClassIds = relevantClasses.map(c => c.id);

        return Object.values(CourseType).map(type => {
            const courseIds = courses.filter(c => c.type === type).map(c => c.id);
            const relevantStudents = students.filter(s =>
                s.classId &&
                relevantClassIds.includes(s.classId) &&
                courseIds.includes(courses.find(c => c.id === classes.find(cls => cls.id === s.classId)?.courseId)?.id || '')
            );

            return {
                name: type,
                Aprovado: relevantStudents.filter(s => s.enrollmentStatus === 'Aprovado').length,
                Reprovado: relevantStudents.filter(s => s.enrollmentStatus === 'Reprovado').length,
                Desligado: relevantStudents.filter(s => s.enrollmentStatus === 'Desligado' || s.enrollmentStatus === 'Cancelado').length,
            };
        }).filter(item => (item.Aprovado + item.Reprovado + item.Desligado) > 0);
    }, [classes, students, courses, yearFilter, classFilter]);

    return (
        <div className="card-premium p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-orange-500" size={20} />
                        Situação dos Alunos
                    </h3>
                    <p className="text-sm text-gray-500">Status por Curso</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={yearFilter}
                        onChange={handleYearChange}
                        className="input-field py-1.5 text-sm w-24"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="input-field py-1.5 text-sm w-40"
                    >
                        <option value="all">Todas as Turmas</option>
                        {availableClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Legend />
                        <Bar dataKey="Aprovado" name="Aprovados" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                        <Bar dataKey="Reprovado" name="Reprovados" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                        <Bar dataKey="Desligado" name="Desligados" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Student Grades Chart (Aggregated View) ---
export const StudentGradesChart: React.FC = () => {
    const { students, classes, courses } = useStore();
    const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
    const [courseTypeFilter, setCourseTypeFilter] = useState<string>('all');
    const [classFilter, setClassFilter] = useState<string>('all');

    // Reset child filters when parent changes
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setYearFilter(e.target.value);
        setCourseTypeFilter('all');
        setClassFilter('all');
    };

    const handleCourseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCourseTypeFilter(e.target.value);
        setClassFilter('all');
    };

    const data = useMemo(() => {
        // 1. Identify relevant classes based on filters
        let relevantClasses = classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );

        if (courseTypeFilter !== 'all') {
            relevantClasses = relevantClasses.filter(c => {
                const course = courses.find(course => course.id === c.courseId);
                return course?.type === courseTypeFilter;
            });
        }

        let targetClasses = relevantClasses;
        if (classFilter !== 'all') {
            targetClasses = relevantClasses.filter(c => c.id === classFilter);
        }

        const targetClassIds = targetClasses.map(c => c.id);

        // 2. Filter students belonging to these classes
        const targetStudents = students.filter(s => s.classId && targetClassIds.includes(s.classId));
        const count = targetStudents.length;

        if (count === 0) return [];

        // 3. Calculate Averages
        const avgFinal = targetStudents.reduce((acc, s) => acc + (typeof s.finalGrade === 'number' ? s.finalGrade : parseFloat(s.finalGrade as string) || 0), 0) / count;
        const avgTheory = targetStudents.reduce((acc, s) => acc + (typeof s.finalTheory === 'number' ? s.finalTheory : parseFloat(s.finalTheory as string) || 0), 0) / count;
        const avgPractice = targetStudents.reduce((acc, s) => acc + (typeof s.finalPractical === 'number' ? s.finalPractical : parseFloat(s.finalPractical as string) || 0), 0) / count;

        // 4. Determine Label
        let label = 'Média Geral';
        if (classFilter !== 'all') {
            label = classes.find(c => c.id === classFilter)?.name || 'Turma Selecionada';
        } else if (courseTypeFilter !== 'all') {
            label = `Média ${courseTypeFilter}`;
        }

        return [{
            name: label,
            'Média Final': Number(avgFinal.toFixed(2)),
            'Média Teórica': Number(avgTheory.toFixed(2)),
            'Média Prática': Number(avgPractice.toFixed(2)),
        }];

    }, [students, classes, courses, yearFilter, courseTypeFilter, classFilter]);

    // Derived lists for dropdowns
    const availableCourseTypes = useMemo(() => {
        const structuralTypes = Object.values(CourseType);
        // We could filter only types that actually have classes in the selected year, 
        // but showing all types is also fine and more consistent UI.
        return structuralTypes;
    }, []);

    const availableClasses = useMemo(() => {
        let filtered = classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );
        if (courseTypeFilter !== 'all') {
            filtered = filtered.filter(c => {
                const course = courses.find(course => course.id === c.courseId);
                return course?.type === courseTypeFilter;
            });
        }
        return filtered;
    }, [classes, courses, yearFilter, courseTypeFilter]);

    return (
        <div className="card-premium p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Award className="text-orange-500" size={20} />
                        Desempenho Geral
                    </h3>
                    <p className="text-sm text-gray-500">Média de Notas (Teórica/Prática/Final)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={yearFilter}
                        onChange={handleYearChange}
                        className="input-field py-1.5 text-sm w-24"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>

                    <select
                        value={courseTypeFilter}
                        onChange={handleCourseTypeChange}
                        className="input-field py-1.5 text-sm w-32"
                    >
                        <option value="all">Todos Cursos</option>
                        {availableCourseTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="input-field py-1.5 text-sm w-40"
                    >
                        <option value="all">Todas as Turmas</option>
                        {availableClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Legend />
                        <Bar dataKey="Média Final" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} label={<CustomBarLabel />} />
                        <Bar dataKey="Média Teórica" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} label={<CustomBarLabel />} />
                        <Bar dataKey="Média Prática" fill="#fdba74" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} label={<CustomBarLabel />} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {data.length === 0 && (
                <div className="text-center text-gray-400 mt-[-150px] mb-[120px]">
                    Nenhum dado encontrado para os filtros selecionados.
                </div>
            )}
        </div>
    );
};

// --- Subject Averages Chart (Schema-Based with Filters) ---


export const SubjectAveragesChart: React.FC = () => {
    const { students, courses, classes } = useStore();
    const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
    const [courseTypeFilter, setCourseTypeFilter] = useState<string>(Object.values(CourseType)[0]);
    const [classFilter, setClassFilter] = useState<string>('all');

    // Reset class filter when course changes
    const handleCourseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCourseTypeFilter(e.target.value);
        setClassFilter('all');
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setYearFilter(e.target.value);
        setCourseTypeFilter(Object.values(CourseType)[0]);
        setClassFilter('all');
    };

    const { chartData, timeAverages } = useMemo(() => {
        // 1. Get Schema for selected Course Type
        const schema = EVALUATION_SCHEMAS[courseTypeFilter as CourseType] || EVALUATION_SCHEMAS[CourseType.CUSTOM];
        // EXCLUDING THEORY as requested ("médias de provas podem ser retiradas")
        const numericFields = [...(schema.avgPracticeFields || [])];
        const timeFields = schema.timeFields || [];

        // 2. Filter data
        let relevantClasses = classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );

        // Filter by Course Type
        relevantClasses = relevantClasses.filter(c => {
            const course = courses.find(course => course.id === c.courseId);
            return course?.type === courseTypeFilter;
        });

        // Filter by Class (if selected)
        if (classFilter !== 'all') {
            relevantClasses = relevantClasses.filter(c => c.id === classFilter);
        }

        const relevantClassIds = relevantClasses.map(c => c.id);
        const relevantStudents = students.filter(s => s.classId && relevantClassIds.includes(s.classId));

        if (relevantStudents.length === 0) return { chartData: [], timeAverages: [] };

        // 3. Aggregate Data
        const stats = new Map<string, { total: number; count: number }>();
        const timeStats = new Map<string, { totalSeconds: number; count: number }>();

        // Initialize maps
        numericFields.forEach(field => stats.set(field, { total: 0, count: 0 }));
        timeFields.forEach(field => timeStats.set(field, { totalSeconds: 0, count: 0 }));

        relevantStudents.forEach(s => {
            if (!s.grades) return;

            // Numeric Grades
            numericFields.forEach(field => {
                const val = s.grades[field];
                let numVal = 0;
                if (typeof val === 'number') {
                    numVal = val;
                } else if (typeof val === 'string') {
                    numVal = parseFloat(val.replace(',', '.'));
                }

                if (!isNaN(numVal) && numVal > 0) { // Consider > 0 to ignore empty/initial states if desired, or >= 0
                    const current = stats.get(field)!;
                    stats.set(field, { total: current.total + numVal, count: current.count + 1 });
                }
            });

            // Time Grades
            timeFields.forEach(field => {
                const val = s.grades[field]; // "MM:SS"
                if (typeof val === 'string' && val.includes(':')) {
                    const [mm, ss] = val.split(':').map(Number);
                    if (!isNaN(mm) && !isNaN(ss)) {
                        const seconds = mm * 60 + ss;
                        const current = timeStats.get(field)!;
                        timeStats.set(field, { totalSeconds: current.totalSeconds + seconds, count: current.count + 1 });
                    }
                }
            });
        });

        // 4. Format for Chart
        const finalChartData = numericFields.map(field => {
            const data = stats.get(field)!;
            return {
                name: field,
                average: data.count > 0 ? Number((data.total / data.count).toFixed(2)) : 0
            };
        }).filter(d => d.average > 0); // Hide empty bars? Or show as 0? Let's hide empty to clean up

        // 5. Format Time Averages
        const finalTimeAverages = timeFields.map(field => {
            const data = timeStats.get(field)!;
            if (data.count === 0) return null;
            const avgSeconds = Math.round(data.totalSeconds / data.count);
            const m = Math.floor(avgSeconds / 60).toString().padStart(2, '0');
            const s = (avgSeconds % 60).toString().padStart(2, '0');
            return { name: field, value: `${m}:${s}` };
        }).filter(Boolean) as { name: string; value: string }[];

        return { chartData: finalChartData, timeAverages: finalTimeAverages };

    }, [students, courses, classes, yearFilter, courseTypeFilter, classFilter]);

    // Derived Classes List for Dropdown
    const availableClasses = useMemo(() => {
        let filtered = classes.filter(c =>
            new Date(c.startDate).getFullYear().toString() === yearFilter ||
            new Date(c.endDate).getFullYear().toString() === yearFilter
        );
        filtered = filtered.filter(c => {
            const course = courses.find(course => course.id === c.courseId);
            return course?.type === courseTypeFilter;
        });
        return filtered;
    }, [classes, courses, yearFilter, courseTypeFilter]);

    return (
        <div className="card-premium p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-orange-500" size={20} />
                        Médias por Matéria (Prática)
                    </h3>
                    <p className="text-sm text-gray-500">Desempenho por Disciplina Prática</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={yearFilter}
                        onChange={handleYearChange}
                        className="input-field py-1.5 text-sm w-24"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                    <select
                        value={courseTypeFilter}
                        onChange={handleCourseTypeChange}
                        className="input-field py-1.5 text-sm w-32"
                    >
                        {Object.values(CourseType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="input-field py-1.5 text-sm w-40"
                    >
                        <option value="all">Todas as Turmas</option>
                        {availableClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-80 w-full mb-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                        <defs>
                            <linearGradient id="colorSubject" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Bar dataKey="average" name="Média" fill="url(#colorSubject)" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} label={<CustomBarLabel />} />
                    </BarChart>
                </ResponsiveContainer>
                {chartData.length === 0 && timeAverages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <p className="text-gray-400 font-medium">Nenhum dado encontrado para os filtros selecionados.</p>
                    </div>
                )}
            </div>

            {/* Time Averages Footer */}
            {timeAverages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2 text-center">Médias de Tempo</h4>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {timeAverages.map(item => (
                            <div key={item.name} className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100 min-w-[150px]">
                                <p className="text-xs text-gray-900 font-bold mb-1 uppercase">{item.name}</p>
                                <p className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
                                    <Clock size={14} className="text-orange-500" />
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Instructor Performance Chart ---
export const InstructorPerformanceChart: React.FC = () => {
    const { classes, users } = useStore();
    const [periodFilter, setPeriodFilter] = useState<string>('all');

    const data = useMemo(() => {




        const instructorStats = new Map<string, { name: string; hours: number; classCount: number }>();

        // Pre-populate NOT needed anymore. We build from data.

        const now = new Date();
        const checkDate = (dateStr: string) => {
            const d = new Date(dateStr);
            if (periodFilter === 'year') return d.getFullYear() === now.getFullYear();
            if (periodFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            return true;
        };

        classes.forEach(cls => {
            const uniqueInstructorsInClass = new Set<string>();
            cls.schedule.forEach(item => {
                if (!checkDate(item.date)) return;
                item.instructorIds.forEach(instId => {
                    const user = users.find(u => u.id === instId);
                    if (!user) return; // Skip if user not found (deleted?)

                    if (!instructorStats.has(instId)) {
                        instructorStats.set(instId, { name: user.name.split(' ')[0], hours: 0, classCount: 0 });
                    }

                    const stats = instructorStats.get(instId)!;
                    stats.hours += item.duration;
                    uniqueInstructorsInClass.add(instId);
                });
            });
            uniqueInstructorsInClass.forEach(instId => {
                const stats = instructorStats.get(instId);
                if (stats) stats.classCount += 1;
            });
        });

        return Array.from(instructorStats.values())
            // Filter logic is implicit: if they are in the map, they have data.
            // But we might want to sort.
            .sort((a, b) => b.hours - a.hours);
    }, [classes, users, periodFilter]);

    return (
        <div className="card-premium p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" size={20} />
                        Instrutores
                    </h3>
                    <p className="text-sm text-gray-500">Performance Geral</p>
                </div>
                <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="input-field py-1.5 text-sm w-32"
                >
                    <option value="all">Todo Período</option>
                    <option value="year">Este Ano</option>
                    <option value="month">Este Mês</option>
                </select>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="hours" name="Horas Aula" fill="url(#colorHours)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                        <Line yAxisId="right" type="monotone" dataKey="classCount" name="Turmas" stroke="#db2777" strokeWidth={3} dot={{ r: 4, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }} animationDuration={1500} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
