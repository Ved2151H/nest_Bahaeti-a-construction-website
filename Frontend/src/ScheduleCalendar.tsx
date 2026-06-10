import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Event, View, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Plus, X, MapPin, Users, Video, Clock, Sparkles, Link as LinkIcon, Loader2, Calendar as CalendarIcon, Filter, Bell, Bot, MessageSquare, Send, CheckSquare } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { PROJECTS, DEVELOPER_DEALS } from './data';
import ReactMarkdown from 'react-markdown';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export interface ScheduleEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'showing' | 'meeting' | 'call' | 'personal';
  location?: string;
  attendees?: string[];
  description?: string;
  linkedProjectId?: string;
  linkedDealId?: string;
  sendReminder?: boolean;
}

// Dummy initial events
const now = new Date();
const initialEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Site Visit - My Nest',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30),
    type: 'showing',
    location: 'My Nest, Solapur',
    attendees: ['Mr. Sharma', 'Mrs. Sharma'],
    linkedProjectId: 'p1',
    linkedDealId: 'd1',
  },
  {
    id: '2',
    title: 'Client Call - Negotiation',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 45),
    type: 'call',
    attendees: ['Rahul Desai'],
    linkedDealId: 'd2',
  },
  {
    id: '3',
    title: 'Internal Team Sync',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 30),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
    type: 'meeting',
    location: 'Conference Room A',
  },
  {
    id: '4',
    title: 'Site Visit - Lodha Altamount',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 13, 0),
    type: 'showing',
    location: 'Lodha Altamount',
  },
];

export default function ScheduleCalendar() {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    title: '',
    type: 'showing',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
  });
  const [smartAddText, setSmartAddText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [filters, setFilters] = useState({ showing: true, meeting: true, call: true, personal: true });
  const [rescheduleDraft, setRescheduleDraft] = useState<{ eventId: string, text: string } | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ai-prep'>('details');
  const [aiPrepContent, setAiPrepContent] = useState<string | null>(null);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const generateAiPrep = async (event: ScheduleEvent) => {
    if (!event.linkedDealId && !event.linkedProjectId) {
      setAiPrepContent("Link a project or deal to generate AI prep notes.");
      return;
    }
    setIsGeneratingPrep(true);
    setAiPrepContent(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const deal = DEVELOPER_DEALS.find(d => d.id === event.linkedDealId);
      const proj = PROJECTS.find(p => p.id === event.linkedProjectId);
      
      const prompt = `Generate a concise 3-bullet meeting prep for a real estate agent. 
      Event: ${event.title}
      Client/Deal: ${deal ? JSON.stringify(deal) : 'None'}
      Project: ${proj ? JSON.stringify(proj) : 'None'}
      Focus on key selling points, client budget/status, and next steps. Format as markdown.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setAiPrepContent(response.text || 'Ready for the meeting.');
    } catch (e) {
      console.error(e);
      setAiPrepContent('Failed to generate prep.');
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({
      title: '',
      type: 'showing',
      start,
      end,
      sendReminder: true,
    });
    setSelectedEvent(null);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setNewEvent(event);
    setActiveTab('details');
    setIsModalOpen(true);
    generateAiPrep(event);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      setEvents(events.map((ev) => (ev.id === selectedEvent.id ? { ...ev, ...newEvent } as ScheduleEvent : ev)));
    } else {
      setEvents([
        ...events,
        {
          ...newEvent,
          id: Math.random().toString(36).substr(2, 9),
        } as ScheduleEvent,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((ev) => ev.id !== selectedEvent.id));
      setIsModalOpen(false);
    }
  };

  const onEventDrop = useCallback(
    async ({ event, start, end }: any) => {
      const oldStart = event.start;
      setEvents((prev) => {
        return prev.map((ev) =>
          ev.id === event.id ? { ...ev, start, end } : ev
        );
      });

      if (oldStart.getTime() !== start.getTime() && (event.attendees?.length || event.linkedDealId)) {
        setIsGeneratingDraft(true);
        setRescheduleDraft(null);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Draft a short, polite WhatsApp message to a client rescheduling their real estate appointment "${event.title}" to ${format(start, 'PPpp')}. Keep it professional and under 3 sentences.`
          });
          setRescheduleDraft({ eventId: event.id, text: response.text || 'Hi, we need to reschedule our appointment. Please let me know if the new time works for you.' });
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingDraft(false);
        }
      }
    },
    [setEvents]
  );

  const onEventResize = useCallback(
    ({ event, start, end }: any) => {
      setEvents((prev) => {
        return prev.map((ev) =>
          ev.id === event.id ? { ...ev, start, end } : ev
        );
      });
    },
    [setEvents]
  );

  const handleSmartAdd = async () => {
    if (!smartAddText.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse this calendar event request: "${smartAddText}". The current date and time is ${new Date().toISOString()}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise title for the event" },
              type: { type: Type.STRING, description: "One of: 'showing', 'meeting', 'call', 'personal'" },
              location: { type: Type.STRING, description: "Location of the event, if any" },
              startIso: { type: Type.STRING, description: "Start time in ISO 8601 format" },
              endIso: { type: Type.STRING, description: "End time in ISO 8601 format" },
              attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of attendee names" }
            },
            required: ["title", "type", "startIso", "endIso"]
          }
        }
      });
      
      const parsed = JSON.parse(response.text || '{}');
      
      setNewEvent({
        title: parsed.title || 'New Event',
        type: (parsed.type as any) || 'showing',
        location: parsed.location || '',
        start: parsed.startIso ? new Date(parsed.startIso) : new Date(),
        end: parsed.endIso ? new Date(parsed.endIso) : new Date(new Date().getTime() + 60 * 60 * 1000),
        attendees: parsed.attendees || [],
      });
      setSelectedEvent(null);
      setIsModalOpen(true);
      setSmartAddText('');
    } catch (error) {
      console.error("Failed to parse event:", error);
      alert("Failed to parse event. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const eventStyleGetter = (event: ScheduleEvent) => {
    let backgroundColor = '#1a201c'; // brand-ink
    let color = '#fdfbf7'; // brand-bg
    let border = '1px solid rgba(255,255,255,0.1)';

    switch (event.type) {
      case 'showing':
        backgroundColor = '#b8860b'; // brand-accent
        color = '#1a201c';
        break;
      case 'meeting':
        backgroundColor = '#2c3e50';
        break;
      case 'call':
        backgroundColor = '#16a085';
        break;
      case 'personal':
        backgroundColor = '#7f8c8d';
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: '4px',
        opacity: 0.9,
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 6px',
        letterSpacing: '0.05em',
      },
    };
  };

  const CustomEvent = ({ event }: { event: ScheduleEvent }) => {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="font-semibold truncate">{event.title}</div>
        <div className="flex items-center gap-1 mt-1 opacity-80 text-[9px]">
          {event.linkedProjectId && <MapPin size={10} />}
          {event.linkedDealId && <Users size={10} />}
        </div>
      </div>
    );
  };

  const filteredEvents = events.filter(ev => filters[ev.type]);

  const upcomingEvents = [...events]
    .filter(ev => ev.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
      {/* Sidebar */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
        <div className="card-premium p-5">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-ink mb-4 flex items-center gap-2">
            <Filter size={14} /> Filters
          </h3>
          <div className="space-y-3">
            {(['showing', 'meeting', 'call', 'personal'] as const).map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${filters[type] ? 'bg-brand-ink border-brand-ink' : 'border-brand-border group-hover:border-brand-ink/50'}`}>
                  {filters[type] && <CheckSquare size={12} className="text-white" />}
                </div>
                <span className="text-sm text-brand-ink/80 capitalize">{type}</span>
                <input type="checkbox" className="hidden" checked={filters[type]} onChange={() => setFilters(prev => ({ ...prev, [type]: !prev[type] }))} />
              </label>
            ))}
          </div>
        </div>

        <div className="card-premium p-5 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-ink mb-4 flex items-center gap-2">
            <CalendarIcon size={14} /> Upcoming
          </h3>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="border-l-2 border-brand-accent pl-3 py-1 cursor-pointer hover:bg-brand-bg/50 transition-colors rounded-r-sm" onClick={() => handleSelectEvent(ev)}>
                <div className="text-xs font-semibold text-brand-ink truncate">{ev.title}</div>
                <div className="text-[10px] text-brand-ink/60 mt-1 flex items-center gap-1">
                  <Clock size={10} /> {format(ev.start, 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-xs text-brand-ink/50 italic">No upcoming events</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 card-premium p-6 flex flex-col relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Calendar</h2>
          <p className="text-xs text-brand-ink/60 mt-1">Manage your showings, meetings, and calls</p>
        </div>
        
        <div className="flex-1 max-w-xl flex gap-2 w-full">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles size={14} className="text-brand-accent" />
            </div>
            <input
              type="text"
              value={smartAddText}
              onChange={(e) => setSmartAddText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSmartAdd()}
              placeholder="Smart Add: 'Showing at The Imperial tomorrow at 2pm'"
              className="w-full bg-brand-secondary border border-brand-border pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink placeholder:text-brand-ink/35 transition-all"
              disabled={isParsing}
            />
          </div>
          <button
            onClick={handleSmartAdd}
            disabled={isParsing || !smartAddText.trim()}
            className="btn-premium-primary px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
          >
            {isParsing ? <Loader2 size={14} className="animate-spin" /> : 'Parse'}
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedEvent(null);
            setNewEvent({
              title: '',
              type: 'showing',
              start: new Date(),
              end: new Date(new Date().getTime() + 60 * 60 * 1000),
            });
            setIsModalOpen(true);
          }}
          className="btn-premium-primary px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={14} /> New Event
        </button>
      </div>

      <div className="flex-1 custom-calendar-wrapper flex flex-col min-h-0">
        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor={(event: ScheduleEvent) => new Date(event.start)}
          endAccessor={(event: ScheduleEvent) => new Date(event.end)}
          style={{ flex: 1, height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          selectable
          resizable
          eventPropGetter={eventStyleGetter as any}
          components={{
            event: CustomEvent as any
          }}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
          popup
        />
        
        {/* Reschedule Draft Toast */}
        {rescheduleDraft && (
          <div className="absolute bottom-6 right-6 z-40 card-premium p-4 w-80 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-semibold text-brand-ink flex items-center gap-2">
                <Bot size={14} className="text-brand-accent" /> AI Reschedule Draft
              </h4>
              <button onClick={() => setRescheduleDraft(null)} className="text-brand-ink/50 hover:text-brand-ink">
                <X size={14} />
              </button>
            </div>
            <div className="bg-brand-bg p-3 rounded-md text-xs text-brand-ink/80 mb-3 border border-brand-border/50">
              {rescheduleDraft.text}
            </div>
            <button className="w-full bg-[#25D366] text-white py-2 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors" onClick={() => setRescheduleDraft(null)}>
              <Send size={12} /> Send via WhatsApp
            </button>
          </div>
        )}
        {isGeneratingDraft && (
          <div className="absolute bottom-6 right-6 z-40 card-premium p-4 w-80 animate-in slide-in-from-bottom-5 flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-brand-accent" />
            <span className="text-xs font-semibold text-brand-ink">Drafting message...</span>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-sm p-4">
          <div className="card-premium w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-brand-border/20 flex justify-between items-center bg-brand-bg/50 shrink-0">
              <h3 className="font-serif text-xl">{selectedEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink transition-colors">
                <X size={20} />
              </button>
            </div>
            {selectedEvent && (
              <div className="flex border-b border-brand-border/20 bg-brand-bg/30 px-6">
                <button
                  className={`py-3 text-xs uppercase tracking-widest font-semibold border-b-2 transition-colors mr-6 ${activeTab === 'details' ? 'border-brand-ink text-brand-ink' : 'border-transparent text-brand-ink/50 hover:text-brand-ink'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-3 text-xs uppercase tracking-widest font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ai-prep' ? 'border-brand-accent text-brand-ink' : 'border-transparent text-brand-ink/50 hover:text-brand-ink'}`}
                  onClick={() => setActiveTab('ai-prep')}
                >
                  <Bot size={14} /> AI Prep
                </button>
              </div>
            )}

            <div className="overflow-y-auto p-6 flex-1">
              {activeTab === 'details' ? (
                <form id="event-form" onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    placeholder="e.g., Site Visit - My Nest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    >
                      <option value="showing">Site Visit</option>
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                      placeholder="e.g., Zoom, Office"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.start ? format(newEvent.start, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.end ? format(newEvent.end, "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Attendees (Comma separated)</label>
                  <input
                    type="text"
                    value={newEvent.attendees?.join(', ') || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    placeholder="e.g., John Doe, Jane Smith"
                  />
                </div>
                
                {/* CRM Links */}
                <div className="pt-4 border-t border-brand-border/20 space-y-4">
                  <h4 className="text-xs font-semibold text-brand-ink flex items-center gap-2">
                    <LinkIcon size={12} /> CRM Links
                  </h4>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Linked Project</label>
                    <select
                      value={newEvent.linkedProjectId || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, linkedProjectId: e.target.value })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    >
                      <option value="">None</option>
                      {PROJECTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">Linked Lead / Deal</label>
                    <select
                      value={newEvent.linkedDealId || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, linkedDealId: e.target.value })}
                      className="w-full bg-brand-secondary border border-brand-border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-accent text-brand-ink transition-all"
                    >
                      <option value="">None</option>
                      {DEVELOPER_DEALS.map(d => (
                        <option key={d.id} value={d.id}>{d.buyerName} - {d.unitName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Reminders Toggle */}
                <div className="pt-4 border-t border-brand-border/20">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${newEvent.sendReminder ? 'bg-brand-accent' : 'bg-brand-border'}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-brand-surface w-3 h-3 rounded-full transition-transform ${newEvent.sendReminder ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-xs font-semibold text-brand-ink flex items-center gap-2">
                      <Bell size={12} /> Send Automated Reminders
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={newEvent.sendReminder || false}
                      onChange={(e) => setNewEvent({ ...newEvent, sendReminder: e.target.checked })}
                    />
                  </label>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {isGeneratingPrep ? (
                  <div className="flex flex-col items-center justify-center py-12 text-brand-ink/50">
                    <Loader2 size={24} className="animate-spin mb-4 text-brand-accent" />
                    <p className="text-xs uppercase tracking-widest font-semibold">Analyzing Deal & Project...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-brand-ink/80">
                    <ReactMarkdown>{aiPrepContent || 'No AI prep available.'}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
            </div>
            <div className="p-6 border-t border-brand-border/20 flex justify-between items-center bg-brand-bg/50 shrink-0">
              {selectedEvent ? (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="text-red-600 text-xs uppercase tracking-widest font-semibold hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-premium-secondary px-4 py-2 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="event-form"
                  className="btn-premium-primary px-6 py-2 text-xs uppercase tracking-widest"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
