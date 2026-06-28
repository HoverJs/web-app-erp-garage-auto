import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import type { Employee } from '../../shared/types';
import { Search, UserPlus, X, Edit, Trash2, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

export const HRView: React.FC = () => {
  const { employees, updateEmployee, createEmployee, deleteEmployee, role } = useGarage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  
  // Drawer states
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'performance' | 'payroll'>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  // RBAC Permission checks
  const isAuthorizedToEdit = role === 'Owner' || role === 'Admin' || role === 'Branch Manager';

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'All' || emp.position === filterPosition;
    const matchesBranch = filterBranch === 'All' || emp.branch === filterBranch;
    return matchesSearch && matchesPosition && matchesBranch;
  });

  const handleOpenDrawer = (emp: Employee | null) => {
    if (emp) {
      setSelectedEmp(emp);
      setFormData(emp);
      setIsEditMode(false);
      setActiveTab('personal');
    } else {
      // Setup empty form for new employee creation
      setSelectedEmp(null);
      setFormData({
        name: '',
        position: 'Technician',
        department: 'Workshop',
        branch: 'Branch A (Downtown)',
        status: 'Active',
        contact: { email: '', phone: '', address: '' },
        hireDate: new Date().toISOString().split('T')[0],
        dob: '1995-01-01',
        baseSalary: 3000,
        allowance: 200,
        bonus: 0,
        overtimeRate: 20,
        kpiScore: 85,
        productivity: 80,
        attendanceRate: 100,
        rating: 5
      });
      setIsEditMode(true);
      setActiveTab('personal');
    }
    setIsDrawerOpen(true);
  };

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: keyof Employee['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...((prev.contact || { email: '', phone: '', address: '' }) as Employee['contact']),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("Name is required");
      return;
    }
    if (selectedEmp) {
      // Update existing
      await updateEmployee(selectedEmp.id, formData);
    } else {
      // Create new
      await createEmployee(formData as Omit<Employee, 'id'>);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = async (empId: string) => {
    if (confirm("Are you sure you want to remove this employee from the ERP directory?")) {
      await deleteEmployee(empId);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>HR Employee Registry</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage employee profile files, salary structures, and performance scores.</p>
        </div>
        {isAuthorizedToEdit && (
          <button className="btn btn-primary" onClick={() => handleOpenDrawer(null)}>
            <UserPlus size={16} />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px 24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          <input
            type="text"
            placeholder="Search by Employee ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        {/* Filter Position */}
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="glass-input glass-select"
          style={{ width: '180px' }}
        >
          <option value="All">All Positions</option>
          <option value="Technician">Technicians</option>
          <option value="Service Advisor">Service Advisors</option>
          <option value="Branch Manager">Branch Managers</option>
          <option value="Accountant">Accountants</option>
          <option value="Inventory Staff">Inventory Staff</option>
          <option value="Receptionist">Receptionists</option>
          <option value="Administrator">Administrators</option>
        </select>
        {/* Filter Branch */}
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="glass-input glass-select"
          style={{ width: '180px' }}
        >
          <option value="All">All Branches</option>
          <option value="Branch A (Downtown)">Branch A (Downtown)</option>
          <option value="Branch B (Westside)">Branch B (Westside)</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Start Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{emp.id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td>{emp.branch.split(' (')[0]}</td>
                  <td>
                    <span className={`badge ${
                      emp.status === 'Active' ? 'badge-success' :
                      emp.status === 'On Leave' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>{emp.hireDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenDrawer(emp)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔎</div>
                      <h3>No employees found</h3>
                      <p>Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="drawer-header">
              <div>
                <h3 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>
                  {selectedEmp ? `Profile: ${selectedEmp.name}` : "Create New Employee"}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedEmp ? `ID: ${selectedEmp.id}` : "ERP Member Registration Form"}
                </span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="tabs-container" style={{ padding: '0 24px', marginBottom: 0 }}>
              <button 
                className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`}
                onClick={() => setActiveTab('employment')}
              >
                Employment
              </button>
              <button 
                className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
                disabled={!selectedEmp}
                style={{ opacity: !selectedEmp ? 0.5 : 1 }}
              >
                Performance
              </button>
              <button 
                className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                onClick={() => setActiveTab('payroll')}
              >
                Payroll Configuration
              </button>
            </div>

            {/* Drawer Body content */}
            <div className="drawer-body">
              
              {/* Tab 1: Personal Info */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditMode}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      disabled={!isEditMode}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="email"
                        value={formData.contact?.email || ''}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="text"
                        value={formData.contact?.phone || ''}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Residential Address</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="text"
                        value={formData.contact?.address || ''}
                        onChange={(e) => handleContactChange('address', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Employment */}
              {activeTab === 'employment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Position Role</label>
                      <select
                        value={formData.position || 'Technician'}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input glass-select"
                      >
                        <option value="Technician">Technician</option>
                        <option value="Service Advisor">Service Advisor</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Inventory Staff">Inventory Staff</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Department</label>
                      <select
                        value={formData.department || 'Workshop'}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input glass-select"
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Service Front">Service Front</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Finance">Finance</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Branch Assigned</label>
                    <select
                      value={formData.branch || 'Branch A (Downtown)'}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      disabled={!isEditMode}
                      className="glass-input glass-select"
                    >
                      <option value="Branch A (Downtown)">Branch A (Downtown)</option>
                      <option value="Branch B (Westside)">Branch B (Westside)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Start Date</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        <input
                          type="date"
                          value={formData.hireDate || ''}
                          onChange={(e) => handleInputChange('hireDate', e.target.value)}
                          disabled={!isEditMode}
                          className="glass-input"
                          style={{ paddingLeft: '36px' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Employment Status</label>
                      <select
                        value={formData.status || 'Active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        disabled={!isEditMode}
                        className="glass-input glass-select"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Performance (Read-only Stats Visualizer) */}
              {activeTab === 'performance' && selectedEmp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* KPI Score card */}
                  <div style={{
                    border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px',
                    background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Performance score index (KPI)</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Aggregated monthly target accomplishment score.</p>
                    </div>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px',
                      color: 'var(--accent-primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)'
                    }}>
                      {selectedEmp.kpiScore}%
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Productivity Rate</span>
                      <h3 style={{ fontSize: '24px', color: 'var(--text-primary)', marginTop: '6px' }}>{selectedEmp.productivity}%</h3>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedEmp.productivity}%`, height: '100%', background: 'var(--accent-success)' }} />
                      </div>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Attendance Rate</span>
                      <h3 style={{ fontSize: '24px', color: 'var(--text-primary)', marginTop: '6px' }}>{selectedEmp.attendanceRate}%</h3>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedEmp.attendanceRate}%`, height: '100%', background: 'var(--accent-info)' }} />
                      </div>
                    </div>

                  </div>

                  {/* Star Customer Ratings */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', background: 'rgba(255, 255, 255, 0.01)', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Customer Service Rating</span>
                    <div style={{ fontSize: '28px', color: 'var(--accent-warning)', margin: '10px 0' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ marginRight: '4px' }}>
                          {i < Math.floor(selectedEmp.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedEmp.rating.toFixed(1)} / 5.0 Rating</span>
                  </div>

                </div>
              )}

              {/* Tab 4: Payroll Configuration */}
              {activeTab === 'payroll' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Base Monthly Salary ($)</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="number"
                        value={formData.baseSalary || 0}
                        onChange={(e) => handleInputChange('baseSalary', Number(e.target.value))}
                        disabled={!isEditMode}
                        className="glass-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Allowances ($)</label>
                      <input
                        type="number"
                        value={formData.allowance || 0}
                        onChange={(e) => handleInputChange('allowance', Number(e.target.value))}
                        disabled={!isEditMode}
                        className="glass-input"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Standard Bonuses ($)</label>
                      <input
                        type="number"
                        value={formData.bonus || 0}
                        onChange={(e) => handleInputChange('bonus', Number(e.target.value))}
                        disabled={!isEditMode}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Overtime Hourly Rate ($/hr)</label>
                    <input
                      type="number"
                      value={formData.overtimeRate || 0}
                      onChange={(e) => handleInputChange('overtimeRate', Number(e.target.value))}
                      disabled={!isEditMode}
                      className="glass-input"
                    />
                  </div>

                </div>
              )}

            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer">
              
              {/* Delete employee trigger */}
              {selectedEmp && isAuthorizedToEdit && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(selectedEmp.id)}
                  style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} />
                  Terminate Profile
                </button>
              )}

              {/* Edit vs Save triggers */}
              {!isEditMode ? (
                isAuthorizedToEdit && (
                  <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
                    <Edit size={14} />
                    Edit Profile
                  </button>
                )
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => selectedEmp ? setIsEditMode(false) : setIsDrawerOpen(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                </>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default HRView;
