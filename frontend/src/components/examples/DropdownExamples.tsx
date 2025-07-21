import React from 'react';
import { Calendar, Download, Filter, ChevronDown } from 'lucide-react';
import Dropdown from '../ui/Dropdown';

const DropdownExamples: React.FC = () => {
  // Date Range Dropdown Items
  const dateRangeItems = [
    {
      id: 'today',
      label: 'Today',
      value: 'today',
      onClick: () => console.log('Today selected'),
    },
    {
      id: 'week',
      label: 'Last 7 Days',
      value: 'week',
      onClick: () => console.log('Last 7 Days selected'),
    },
    {
      id: 'month',
      label: 'Last 30 Days',
      value: 'month',
      onClick: () => console.log('Last 30 Days selected'),
    },
    {
      id: 'quarter',
      label: 'Last 3 Months',
      value: 'quarter',
      onClick: () => console.log('Last 3 Months selected'),
    },
    {
      id: 'year',
      label: 'Last Year',
      value: 'year',
      onClick: () => console.log('Last Year selected'),
    },
    {
      id: 'divider-1',
      label: '',
      value: '',
      isDivider: true,
    },
    {
      id: 'custom',
      label: 'Custom Range',
      value: 'custom',
      onClick: () => console.log('Custom Range selected'),
    },
  ];

  // Download Options
  const downloadItems = [
    {
      id: 'pdf',
      label: 'Download PDF',
      value: 'pdf',
      icon: <i className="fas fa-file-pdf text-red-600" />,
      description: 'Portable Document Format',
      onClick: () => console.log('PDF download'),
    },
    {
      id: 'excel',
      label: 'Download Excel',
      value: 'excel',
      icon: <i className="fas fa-file-excel text-green-600" />,
      description: 'Microsoft Excel format',
      onClick: () => console.log('Excel download'),
    },
    {
      id: 'csv',
      label: 'Download CSV',
      value: 'csv',
      icon: <i className="fas fa-file-csv text-blue-600" />,
      description: 'Comma-separated values',
      onClick: () => console.log('CSV download'),
    },
    {
      id: 'json',
      label: 'Download JSON',
      value: 'json',
      icon: <i className="fas fa-file-code text-orange-600" />,
      description: 'JavaScript Object Notation',
      onClick: () => console.log('JSON download'),
    },
  ];

  // Filter Options
  const filterItems = [
    {
      id: '5',
      label: '5 per page',
      value: 5,
      onClick: () => console.log('5 per page'),
    },
    {
      id: '10',
      label: '10 per page',
      value: 10,
      onClick: () => console.log('10 per page'),
    },
    {
      id: '25',
      label: '25 per page',
      value: 25,
      onClick: () => console.log('25 per page'),
    },
    {
      id: '50',
      label: '50 per page',
      value: 50,
      onClick: () => console.log('50 per page'),
    },
    {
      id: '100',
      label: '100 per page',
      value: 100,
      onClick: () => console.log('100 per page'),
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dropdown Component Examples</h1>
        
        {/* Date Range Picker Example */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Date Range Picker</h2>
          <p className="text-gray-600 mb-6">Matches the Reports page date range picker styling</p>
          
          <div className="date-range-picker">
            <Dropdown
              trigger={
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Last 30 Days</span>
                </>
              }
              items={dateRangeItems}
              className="inline-block"
              onItemSelect={(item) => console.log('Date range selected:', item)}
            />
          </div>
        </div>

        {/* Download Button Example */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Download Button</h2>
          <p className="text-gray-600 mb-6">Matches the Invoices page download button styling</p>
          
          <div className="btn-group">
            <Dropdown
              trigger={
                <>
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </>
              }
              items={downloadItems}
              className="inline-block"
              onItemSelect={(item) => console.log('Download format selected:', item)}
            />
          </div>
        </div>

        {/* Filter Options Example */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Options</h2>
          <p className="text-gray-600 mb-6">Matches the pagination dropdown styling</p>
          
          <div className="filter-options">
            <Dropdown
              trigger={
                <>
                  <Filter className="h-4 w-4" />
                  <span>10 per page</span>
                </>
              }
              items={filterItems}
              className="inline-block"
              onItemSelect={(item) => console.log('Filter selected:', item)}
            />
          </div>
        </div>

        {/* Standard Dropdown Example */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Standard Dropdown</h2>
          <p className="text-gray-600 mb-6">Basic dropdown with modern styling</p>
          
          <Dropdown
            trigger={
              <>
                <span>Select Option</span>
              </>
            }
            items={[
              {
                id: 'option1',
                label: 'Option 1',
                value: 'option1',
                description: 'First option description',
                onClick: () => console.log('Option 1 selected'),
              },
              {
                id: 'option2',
                label: 'Option 2',
                value: 'option2',
                description: 'Second option description',
                onClick: () => console.log('Option 2 selected'),
              },
              {
                id: 'option3',
                label: 'Option 3',
                value: 'option3',
                description: 'Third option description',
                onClick: () => console.log('Option 3 selected'),
              },
            ]}
            className="inline-block"
            onItemSelect={(item) => console.log('Standard option selected:', item)}
          />
        </div>

        {/* Placement Examples */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dropdown Placements</h2>
          <p className="text-gray-600 mb-6">Different dropdown positioning options</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bottom Right (Default)</h3>
              <Dropdown
                trigger={<span>Bottom Right</span>}
                items={filterItems.slice(0, 3)}
                placement="bottom-right"
                className="inline-block"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bottom Left</h3>
              <Dropdown
                trigger={<span>Bottom Left</span>}
                items={filterItems.slice(0, 3)}
                placement="bottom-left"
                className="inline-block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownExamples;