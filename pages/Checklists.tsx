
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/AppStore';
import { UserRole, ChecklistType, ChecklistItemResult, ChecklistLog, ChecklistItemDefinition } from '../types';
import { ClipboardList, CheckCircle, XCircle, Plus, Trash2, Camera, MessageSquare, AlertTriangle, Eye, Settings } from 'lucide-react';

export const ChecklistsPage: React.FC = () => {
    const { currentUser, checklistTemplates, checklistLogs, addChecklistLog, updateChecklistTemplate, classes } = useStore();
    const [activeTab, setActiveTab] = useState<'fill' | 'history' | 'manage'>('fill');

    // Fill State
    const [selectedType, setSelectedType] = useState<ChecklistType | ''>('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStage, setSelectedStage] = useState<'INICIO' | 'TERMINO'>('INICIO');
    const [itemsResult, setItemsResult] = useState<{ [itemId: string]: ChecklistItemResult }>({});
    const [logNotes, setLogNotes] = useState('');

    // Management State
    const [manageType, setManageType] = useState<ChecklistType>('VEICULO');
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');

    if (!currentUser) return null;

    const isManager = currentUser.role === UserRole.GESTOR || currentUser.role === UserRole.COORDENADOR;
    const isDriver = currentUser.role === UserRole.MOTORISTA;
    const isInstructor = currentUser.role === UserRole.INSTRUTOR;

    // --- Logic for Fill Tab ---

    const availableTemplates = checklistTemplates.filter(t => {
        if (isManager) return true;
        if (isDriver) return t.type === 'VEICULO';
        if (isInstructor) return t.type === 'EQUIPAMENTOS';
        return false;
    });

    const activeTemplate = checklistTemplates.find(t => t.type === selectedType);

    const handleStartChecklist = (type: ChecklistType) => {
        setSelectedType(type);
        setItemsResult({});
        setLogNotes('');
        // Pre-fill results as N/A or empty
        const t = checklistTemplates.find(tpl => tpl.type === type);
        if (t) {
            const initialResults: any = {};
            t.items.forEach(item => {
                initialResults[item.id] = { itemId: item.id, itemText: item.text, status: 'Conforme' };
            });
            setItemsResult(initialResults);
        }
    };

    const handleItemChange = (itemId: string, field: keyof ChecklistItemResult, value: any) => {
        setItemsResult(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };

    const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleItemChange(itemId, 'photoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!activeTemplate) return;
        if (selectedType === 'EQUIPAMENTOS' && !selectedClassId) {
            alert('Por favor, selecione a turma.');
            return;
        }

        // Check for non-compliances
        const resultsArray = Object.values(itemsResult) as ChecklistItemResult[];
        const isCompliant = resultsArray.every(r => r.status === 'Conforme' || r.status === 'N/A');

        const log: ChecklistLog = {
            id: Math.random().toString(36).substr(2, 9),
            templateId: activeTemplate.id,
            type: activeTemplate.type,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            classId: selectedType === 'EQUIPAMENTOS' ? selectedClassId : undefined,
            stage: selectedType === 'EQUIPAMENTOS' ? selectedStage : undefined,
            items: resultsArray,
            isCompliant,
            notes: logNotes
        };

        addChecklistLog(log);
        alert('Checklist salvo com sucesso!');
        setSelectedType('');
        setActiveTab('history');
    };

    // --- Logic for Manage Tab ---

    const manageTemplate = checklistTemplates.find(t => t.type === manageType);

    const handleAddItem = () => {
        if (!newItemText || !manageTemplate) return;
        const newItem: ChecklistItemDefinition = {
            id: Math.random().toString(36).substr(2, 9),
            text: newItemText,
            category: newItemCategory || 'Geral'
        };

        const updatedTemplate = {
            ...manageTemplate,
            items: [...manageTemplate.items, newItem]
        };
        updateChecklistTemplate(updatedTemplate);
        setNewItemText('');
    };

    const handleDeleteItem = (itemId: string) => {
        if (!manageTemplate) return;
        if (!window.confirm('Remover este item do checklist?')) return;

        const updatedTemplate = {
            ...manageTemplate,
            items: manageTemplate.items.filter(i => i.id !== itemId)
        };
        updateChecklistTemplate(updatedTemplate);
    };

    // --- UI Components ---

    const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white text-gray-900";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center animate-slide-down">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Checklists Operacionais</h1>
                    <p className="text-gray-500 mt-1">Gerencie verificações e inspeções</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('fill')}
                        className={`${activeTab === 'fill' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <ClipboardList size={18} /> Preencher
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <ClipboardList size={18} /> Histórico
                    </button>
                    {isManager && (
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`${activeTab === 'manage' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <Settings size={18} /> Gerenciar Modelos
                        </button>
                    )}
                </nav>
            </div>

            {/* Content */}

            {/* --- FILL TAB --- */}
            {activeTab === 'fill' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    {!selectedType ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableTemplates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleStartChecklist(t.type)}
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition group"
                                >
                                    <ClipboardList size={48} className="text-gray-400 group-hover:text-primary-500 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                                    <p className="text-sm text-gray-500 text-center mt-2">
                                        {t.type === 'VEICULO' ? 'Verificação diária da carreta e caminhão.' : 'Controle de materiais por curso.'}
                                    </p>
                                </button>
                            ))}
                            {availableTemplates.length === 0 && (
                                <p className="text-gray-500 italic">Nenhum checklist disponível para o seu perfil.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-gray-900">{activeTemplate?.title}</h2>
                                <button onClick={() => setSelectedType('')} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                            </div>

                            {selectedType === 'EQUIPAMENTOS' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                                        <select className={inputClass} value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                                            <option value="">Selecione a turma...</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                                        <div className="flex space-x-4 mt-2">
                                            <label className="inline-flex items-center">
                                                <input type="radio" className="form-radio text-primary-600" checked={selectedStage === 'INICIO'} onChange={() => setSelectedStage('INICIO')} />
                                                <span className="ml-2 text-gray-700">Início do Curso</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input type="radio" className="form-radio text-primary-600" checked={selectedStage === 'TERMINO'} onChange={() => setSelectedStage('TERMINO')} />
                                                <span className="ml-2 text-gray-700">Término do Curso</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {activeTemplate?.items.map(item => {
                                    const result = itemsResult[item.id] || { status: 'N/A' };
                                    const isNonCompliant = result.status === 'Não Conforme';

                                    return (
                                        <div key={item.id} className={`p-4 rounded-lg border ${isNonCompliant ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{item.category}</span>
                                                    <p className="font-medium text-gray-900">{item.text}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleItemChange(item.id, 'status', 'Conforme')}
                                                        className={`px-3 py-2 rounded-md flex items-center gap-1 text-sm font-medium ${result.status === 'Conforme' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        <CheckCircle size={16} /> Conforme
                                                    </button>
                                                    <button
                                                        onClick={() => handleItemChange(item.id, 'status', 'Não Conforme')}
                                                        className={`px-3 py-2 rounded-md flex items-center gap-1 text-sm font-medium ${result.status === 'Não Conforme' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        <XCircle size={16} /> Não Conforme
                                                    </button>
                                                </div>
                                            </div>

                                            {isNonCompliant && (
                                                <div className="mt-4 pt-4 border-t border-red-100 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-red-700 mb-1">Comentário Obrigatório</label>
                                                        <textarea
                                                            className={`${inputClass} border-red-300 focus:ring-red-500 focus:border-red-500`}
                                                            rows={2}
                                                            placeholder="Descreva o problema..."
                                                            value={result.comment || ''}
                                                            onChange={e => handleItemChange(item.id, 'comment', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-red-700 mb-1">Foto da Evidência</label>
                                                        <div className="flex items-center gap-2">
                                                            <label className="cursor-pointer bg-white border border-red-300 text-red-700 px-3 py-2 rounded shadow-sm hover:bg-red-50 text-sm flex items-center gap-2">
                                                                <Camera size={16} /> Adicionar Foto
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(item.id, e)} />
                                                            </label>
                                                            {result.photoUrl && <span className="text-xs text-green-600 font-medium">Foto anexada!</span>}
                                                        </div>
                                                        {result.photoUrl && (
                                                            <img src={result.photoUrl} alt="Evidência" className="mt-2 h-20 w-auto rounded border border-gray-300" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Observações Gerais</label>
                                <textarea
                                    className={`${inputClass} h-24`}
                                    rows={3}
                                    value={logNotes}
                                    onChange={e => setLogNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="btn-premium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-3 rounded-lg shadow-md font-semibold transition-all duration-200"
                                >
                                    Salvar Checklist
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data / Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {checklistLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Nenhum checklist registrado.</td>
                                    </tr>
                                )}
                                {checklistLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.type === 'VEICULO' ? 'Veículo Diário' : 'Equipamentos'}
                                            {log.stage && <span className="block text-xs text-gray-400">{log.stage === 'INICIO' ? 'Início' : 'Término'}</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.userName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {log.isCompliant ? 'Conforme' : 'Não Conforme'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => alert('Feature: Modal de detalhes do checklist (em desenvolvimento)')}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- MANAGE TAB --- */}
            {activeTab === 'manage' && isManager && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setManageType('VEICULO')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${manageType === 'VEICULO' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                            Veículo / Caminhão
                        </button>
                        <button
                            onClick={() => setManageType('EQUIPAMENTOS')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${manageType === 'EQUIPAMENTOS' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                            Materiais / Equipamentos
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2 items-end bg-gray-50 p-4 rounded-lg">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Novo Item</label>
                                <input
                                    className={inputClass}
                                    placeholder="Descrição do item..."
                                    value={newItemText}
                                    onChange={e => setNewItemText(e.target.value)}
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                                <input
                                    className={inputClass}
                                    placeholder="Ex: Cabine, EPIs..."
                                    value={newItemCategory}
                                    onChange={e => setNewItemCategory(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 h-[38px] w-[38px] flex items-center justify-center"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                            {manageTemplate?.items.map(item => (
                                <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">{item.category}</span>
                                        <span className="text-gray-900 font-medium">{item.text}</span>
                                    </div>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};