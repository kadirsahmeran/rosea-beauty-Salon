import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getServices } from "../../lib/queries/services";
import {
  getBookedSlotsForDate,
  getSpecialistAvailability,
  getSpecialistsForService,
  getSpecialistTimeOff,
} from "../../lib/queries/booking";
import { initializeCheckout } from "../../lib/queries/payment";
import { computeAvailableTimeSlots } from "../../lib/bookingLogic";
import { useSupabaseQuery } from "../../lib/useSupabaseQuery";
import { SectionError, SectionLoading } from "../SectionState";
import { buildCalendarDays } from "./format";
import DateTimeStep from "./DateTimeStep";
import DetailsStep from "./DetailsStep";
import ServiceStep from "./ServiceStep";
import SpecialistStep from "./SpecialistStep";
import StepIndicator from "./StepIndicator";

export default function BookingWizard({ initialServiceSlug = null }) {
  const { data: services, loading, error } = useSupabaseQuery(
    "all-services",
    getServices,
    [],
  );

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [specialists, setSpecialists] = useState([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [specialistsError, setSpecialistsError] = useState(null);

  const [availability, setAvailability] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", phone: "", email: "", notes: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!services || !initialServiceSlug || selectedService) return;
    const match = services.find((s) => s.id === initialServiceSlug);
    if (match) {
      setSelectedService(match);
      setStep(1);
    }
  }, [services, initialServiceSlug, selectedService]);

  useEffect(() => {
    if (!selectedService) {
      setSpecialists([]);
      return;
    }

    let cancelled = false;
    setSpecialistsLoading(true);
    setSpecialistsError(null);

    getSpecialistsForService(selectedService.dbId)
      .then((data) => {
        if (!cancelled) setSpecialists(data);
      })
      .catch((err) => {
        if (!cancelled) setSpecialistsError(err);
      })
      .finally(() => {
        if (!cancelled) setSpecialistsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedService]);

  useEffect(() => {
    if (!selectedSpecialist) {
      setAvailability([]);
      setTimeOff([]);
      return;
    }

    let cancelled = false;
    setScheduleLoading(true);

    Promise.all([
      getSpecialistAvailability(selectedSpecialist.id),
      getSpecialistTimeOff(selectedSpecialist.id),
    ])
      .then(([avail, off]) => {
        if (!cancelled) {
          setAvailability(avail);
          setTimeOff(off);
        }
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSpecialist]);

  useEffect(() => {
    if (!selectedSpecialist || !selectedDate) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    getBookedSlotsForDate(selectedSpecialist.id, selectedDate)
      .then((data) => {
        if (!cancelled) setBookedSlots(data);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSpecialist, selectedDate]);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth.year, calendarMonth.month),
    [calendarMonth],
  );

  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    return computeAvailableTimeSlots({
      dateString: selectedDate,
      availability,
      timeOff,
      bookedSlots,
      durationMinutes: selectedService.durationMinutes,
    });
  }, [selectedService, selectedDate, availability, timeOff, bookedSlots]);

  function selectService(service) {
    setSelectedService(service);
    setSelectedSpecialist(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(1);
  }

  function selectSpecialist(specialist) {
    setSelectedSpecialist(specialist);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  }

  function selectDate(dateString) {
    setSelectedDate(dateString);
    setSelectedSlot(null);
  }

  function prevMonth() {
    setCalendarMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  }

  function nextMonth() {
    setCalendarMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  }

  async function onSubmit(values) {
    if (!selectedService || !selectedSpecialist || !selectedSlot) return;

    setSubmitError(null);

    try {
      const result = await initializeCheckout({
        serviceId: selectedService.dbId,
        specialistId: selectedSpecialist.id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        customerName: values.name.trim(),
        customerPhone: values.phone.trim(),
        customerEmail: values.email.trim(),
        notes: values.notes.trim() || null,
      });

      window.location.assign(result.paymentPageUrl);
    } catch (err) {
      setSubmitError(
        err.message?.includes("az önce dolmuş") ||
          err.message?.includes("appointments_no_overlap")
          ? "Seçtiğiniz saat az önce dolmuş. Lütfen başka bir saat seçin."
          : err.message ||
            "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    }
  }

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message="Hizmetler yüklenemedi." />;

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="mt-10">
        {step === 0 && (
          <ServiceStep
            services={services}
            selectedService={selectedService}
            onSelect={selectService}
          />
        )}

        {step === 1 && (
          <SpecialistStep
            serviceTitle={selectedService?.title}
            specialists={specialists}
            selectedSpecialist={selectedSpecialist}
            loading={specialistsLoading}
            error={specialistsError}
            onBack={() => setStep(0)}
            onSelect={selectSpecialist}
          />
        )}

        {step === 2 && (
          <DateTimeStep
            specialistName={selectedSpecialist?.name}
            scheduleLoading={scheduleLoading}
            calendarMonth={calendarMonth}
            calendarDays={calendarDays}
            availability={availability}
            timeOff={timeOff}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            availableSlots={availableSlots}
            slotsLoading={slotsLoading}
            onBack={() => setStep(1)}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onSelectDate={selectDate}
            onSelectSlot={setSelectedSlot}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <DetailsStep
            service={selectedService}
            specialist={selectedSpecialist}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onBack={() => setStep(2)}
            onSubmit={onSubmit}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
