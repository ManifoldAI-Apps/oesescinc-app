
import React, { useMemo } from 'react';
import { useStore } from '../context/AppStore';
import { UserRole, CourseType } from '../types';
import { BookOpen, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
    const { classes, students, tasks, currentUser, payments } = useStore();

    if (!currentUser) return null;

    const isManager = currentUser.role === UserRole.GESTOR || currentUser.role === UserRole.COORDENADOR;

    // --- NON-MANAGER VIEW (Personal Summary) ---
    if (!isManager) {
        const myNextClasses = classes
            .flatMap(c => c.schedule.map(s => ({ ...s, className: c.name })))
            .filter(s => s.instructorIds.includes(currentUser.id) && new Date(s.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);

        const myPendingTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'Concluída');

        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {currentUser.name.split(' ')[0]}!</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Next Classes Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-primary-600" /> Próximas Aulas
                        </h2>
                        {myNextClasses.length === 0 ? (
                            <p className="text-gray-500 italic">Nenhuma aula agendada para os próximos dias.</p>
                        ) : (
                            <div className="space-y-3">
                                {myNextClasses.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                        <div>
                                            <p className="font-semibold text-gray-800">{new Date(item.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">{item.startTime} - {item.endTime}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{item.moduleId}</p>
                                            <p className="text-xs text-gray-500">{item.className}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tasks Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-green-600" /> Minhas Tarefas
                        </h2>
                        {myPendingTasks.length === 0 ? (
                            <p className="text-gray-500 italic">Você não tem tarefas pendentes.</p>
                        ) : (
                            <div className="space-y-3">
                                {myPendingTasks.map(task => (
                                    <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-800">{task.title}</p>
                                            <p className="text-xs text-gray-500">Prazo: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Sem prazo'}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${task.priority === 'Alta' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- MANAGER DASHBOARD (KPIs) ---

    // 1. Financial Stats
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalRevenue = 150000; // Mock target/total
    const toPay = totalRevenue - totalPaid;

    // 2. Hours Stats
    const today = new Date();
    const totalHoursTaught = classes.reduce((acc, cls) => {
        const pastItems = cls.schedule.filter(item => new Date(item.date) <= today);
        return acc + pastItems.reduce((sAcc, item) => sAcc + item.duration, 0);
    }, 0);

    // 3. Charts Data: Graduated Students per Course Type
    const graduatedPerCourse = [
        { name: 'CBA-2', value: 0 },
        { name: 'CBA-2 Comp', value: 0 },
        { name: 'CBA-AT', value: 0 },
        { name: 'CBA-CE', value: 0 }
    ];

    // Re-implementation using the actual store data structure
    const { courses } = useStore();

    courses.forEach(c => {
        const classIds = classes.filter(cls => cls.courseId === c.id).map(cls => cls.id);
        const approvedCount = students.filter(s => s.classId && classIds.includes(s.classId) && s.enrollmentStatus === 'Aprovado').length;

        if (c.type === CourseType.CBA_2) graduatedPerCourse[0].value += approvedCount;
        else if (c.type === CourseType.CBA_2_COMP) graduatedPerCourse[1].value += approvedCount;
        else if (c.type === CourseType.CBA_AT) graduatedPerCourse[2].value += approvedCount;
        else if (c.type === CourseType.CBA_CE) graduatedPerCourse[3].value += approvedCount;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
                    <p className="text-gray-500 mt-1">Visão geral de performance e indicadores.</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded border shadow-sm">
                    Atualizado: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Cards Row 1 - Financials & Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 font-medium mb-1">Total Pago (Instrutores)</p>
                            <h3 className="text-3xl font-bold">R$ {totalPaid.toLocaleString('pt-BR')}</h3>
                        </div>
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <DollarSign size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-100">
                        <CheckCircle size={14} className="mr-1" /> 100% em dia
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 font-medium mb-1">Previsão a Pagar</p>
                            <h3 className="text-3xl font-bold">R$ {toPay.toLocaleString('pt-BR')}</h3>
                        </div>
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <Clock size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-orange-100">
                        <AlertCircle size={14} className="mr-1" /> Próximo fechamento: 30/30
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Horas Aula Ministradas</p>
                            <h3 className="text-3xl font-bold">{totalHoursTaught}h</h3>
                        </div>
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <BookOpen size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-100">
                        <TrendingUp size={14} className="mr-1" /> Aulas Realizadas
                    </div>
                </div>
            </div>

            {/* Chart Row */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Alunos Formados por Curso</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={graduatedPerCourse} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} />
                            <Bar dataKey="value" name="Formados" fill="#f97316" radius={[4, 4, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Lower Section: Recent Activity (Mock) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Atividades Recentes</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Novo pagamento registrado</p>
                                    <p className="text-xs text-gray-500">Há {i * 2} horas • Por Ana Coordenadora</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
