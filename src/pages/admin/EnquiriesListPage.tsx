import React, { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';
import { Enquiry } from '../../types';
import { Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export const EnquiriesListPage: React.FC = () => {
  const { enquiries, updateEnquiryStatus } = useApp();

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleOpenEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (newStatus: 'new' | 'in_progress' | 'resolved') => {
    if (!selectedEnquiry) return;
    updateEnquiryStatus(selectedEnquiry.id, newStatus);
    setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
  };

  const columns: Column<Enquiry>[] = [
    {
      key: 'name',
      header: 'Sender',
      render: (enq) => (
        <div>
          <span className="font-heading font-bold text-navy text-sm block">{enq.name}</span>
          <span className="text-xs text-content-muted">{enq.email}</span>
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topic',
      render: (enq) => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {enq.topic.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message Preview',
      render: (enq) => (
        <span className="text-xs text-content-body max-w-sm block truncate">
          {enq.message}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (enq) => <StatusBadge status={enq.status} />,
    },
    {
      key: 'date',
      header: 'Received',
      render: (enq) => <span className="text-xs text-content-muted">{enq.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (enq) => (
        <Button onClick={() => handleOpenEnquiry(enq)} variant="outline" size="sm">
          View Message
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Website Inquiries &amp; Messages"
        description="Public contact form submissions forwarded to the office demonstration inbox."
      />

      <DataTable
        columns={columns}
        data={enquiries}
        keyExtractor={(item) => item.id}
        emptyTitle="No Messages Received"
        emptyDescription="Submissions from the public Contact page will appear here."
      />

      {/* View Enquiry Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Message from ${selectedEnquiry?.name}`}
        description={`Topic: ${selectedEnquiry?.topic.replace('_', ' ')} • Received: ${selectedEnquiry?.createdAt}`}
      >
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
              <p><strong>Sender Email:</strong> {selectedEnquiry.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <strong>Status:</strong> <StatusBadge status={selectedEnquiry.status} size="sm" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-navy">Message Content:</span>
              <p className="p-4 bg-white rounded-brand border border-border-subtle text-sm text-content-body leading-relaxed">
                {selectedEnquiry.message}
              </p>
            </div>

            {/* Status Modification Controls */}
            <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-content-muted">Update Status:</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  variant={selectedEnquiry.status === 'in_progress' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => handleStatusChange('resolved')}
                  variant={selectedEnquiry.status === 'resolved' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
