
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/AppStore';
import { CourseType, UserRole } from '../types';
import { FileBadge, Search, Filter, Printer, Award } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
    const { students, classes, courses, currentUser } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    if (!currentUser || (currentUser.role !== UserRole.GESTOR && currentUser.role !== UserRole.COORDENADOR)) {
        return <div className="p-8 text-center text-gray-500">Acesso não autorizado.</div>;
    }

    const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900";

    // Derive Certificate Data
    const certificateData = useMemo(() => {
        const today = new Date();

        return students.filter(s => {
            if (!s.classId) return false;
            const cls = classes.find(c => c.id === s.classId);
            if (!cls) return false;

            const isClassFinished = new Date(cls.endDate) < today;
            const isApproved = s.enrollmentStatus === 'Aprovado';

            return isClassFinished || isApproved;
        }).map(s => {
            const cls = classes.find(c => c.id === s.classId);
            const course = courses.find(c => c.id === cls?.courseId);

            let num = '00';
            let year = '2025';
            if (cls?.name) {
                const parts = cls.name.split(' ');
                const suffix = parts[parts.length - 1];
                if (suffix.includes('/')) {
                    [num, year] = suffix.split('/');
                }
            }

            return {
                id: s.id,
                name: s.name,
                cpf: s.cpf,
                courseName: course?.name || 'N/A',
                endDate: cls?.endDate,
                classId: cls?.id,
                className: cls?.name,
                year: year,
                matricula: s.matricula || 'Gerado em Alunos',
                registro: s.registro || 'Gerado em Alunos',
                capBa: s.capCode || 'Gerado em Alunos'
            };
        });
    }, [students, classes, courses]);

    const filteredCertificates = certificateData.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cpf.includes(searchTerm);
        const matchesClass = classFilter ? c.classId === classFilter : true;
        const matchesYear = yearFilter ? c.year === yearFilter : true;
        return matchesSearch && matchesClass && matchesYear;
    });

    const handlePrint = (id: string) => {
        alert('Funcionalidade de impressão de certificado em desenvolvimento.');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Consulta de Certificados</h1>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filtrar por Nome ou CPF"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900"
                    />
                </div>
                <div>
                    <select
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="">Todas as Turmas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="">Todos os Anos</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
            </div>

            {/* Certificates Grid/List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredCertificates.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
                        <Award className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 italic">Nenhum certificado disponível para os filtros selecionados.</p>
                    </div>
                ) : (
                    filteredCertificates.map(cert => (
                        <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0">
                                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg border border-primary-100">
                                    {cert.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{cert.name}</h3>
                                    <p className="text-sm text-gray-500">CPF: {cert.cpf}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                            Mat: {cert.matricula}
                                        </span>
                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs border border-green-100">
                                            Reg: {cert.registro}
                                        </span>
                                        {cert.capBa && cert.capBa !== '-' && (
                                            <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs border border-orange-100">
                                                CAP: {cert.capBa}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                                <div className="text-center md:text-right">
                                    <p className="text-sm font-bold text-gray-800">{cert.courseName}</p>
                                    <p className="text-xs text-gray-500">
                                        Conclusão: {cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handlePrint(cert.id)}
                                    className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <Printer size={18} />
                                    <span>Emitir</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
