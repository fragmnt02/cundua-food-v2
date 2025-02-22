import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useCity } from '@/hooks/useCity';
import {
  CITY_USER_FRIENDLY_NAME,
  DELIVERY_COMPANIES,
  type DeliveryCompany
} from '@/lib/constants';
import { FaPhone, FaSearch, FaClock } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useMemo, memo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DeliveryDialogProps {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
}

const isCompanyOpen = (company: DeliveryCompany) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  return currentTime >= company.open && currentTime <= company.close;
};

const DeliveryCompanyCard = memo(
  ({ company }: { company: DeliveryCompany }) => {
    const phoneNumber = company.phone.replace(/\D/g, '');
    const [isHovered, setIsHovered] = useState(false);
    const isOpen = isCompanyOpen(company);

    return (
      <div
        className={cn(
          'flex flex-col gap-3 p-4 rounded-lg transition-all duration-200',
          isHovered && 'transform scale-[1.02] shadow-lg',
          isOpen ? 'bg-muted' : 'bg-muted/50'
        )}
        role="article"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-lg">{company.name}</h3>
          <Badge
            variant={isOpen ? 'default' : 'secondary'}
            className={cn(
              'transition-colors',
              isOpen
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaClock className="text-base" aria-hidden="true" />
          <span>
            {company.open} - {company.close} hrs
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`tel:${phoneNumber}`}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-md',
              isOpen
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
            )}
            aria-label={`Llamar a ${company.name} al ${company.phone}`}
            {...(!isOpen && {
              'aria-disabled': true,
              onClick: (e) => e.preventDefault()
            })}
          >
            <FaPhone className="text-xl" aria-hidden="true" />
            <span>{company.phone}</span>
          </a>
          <a
            href={`https://wa.me/+521${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-md',
              isOpen
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-400 hover:bg-green-500 cursor-not-allowed'
            )}
            aria-label={`Enviar WhatsApp a ${company.name}`}
            {...(!isOpen && {
              'aria-disabled': true,
              onClick: (e) => e.preventDefault()
            })}
          >
            <FaWhatsapp className="text-xl" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }
);

DeliveryCompanyCard.displayName = 'DeliveryCompanyCard';

export const DeliveryDialog = ({
  open,
  handleOpenChange
}: DeliveryDialogProps) => {
  const { city } = useCity();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Memoize city data
  const { cityCompanies, cityName } = useMemo(
    () => ({
      cityCompanies:
        DELIVERY_COMPANIES[city as keyof typeof DELIVERY_COMPANIES],
      cityName:
        CITY_USER_FRIENDLY_NAME[city as keyof typeof CITY_USER_FRIENDLY_NAME]
    }),
    [city]
  );

  // Memoize and sort filtered companies
  const filteredCompanies = useMemo(() => {
    if (!cityCompanies?.length) return [];

    const filtered = !searchQuery.trim()
      ? [...cityCompanies]
      : cityCompanies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.phone.includes(searchQuery)
        );

    // Sort by open status (open first) and then by name
    return filtered.sort((a, b) => {
      const aOpen = isCompanyOpen(a);
      const bOpen = isCompanyOpen(b);
      if (aOpen === bOpen) {
        return a.name.localeCompare(b.name);
      }
      return aOpen ? -1 : 1;
    });
  }, [cityCompanies, searchQuery]);

  // Handle loading state
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Update companies status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update open/closed status
      setIsLoading((i) => !i);
      setTimeout(() => setIsLoading((i) => !i), 100);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold mb-4">
            Motomandados en {cityName}
          </DialogTitle>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </DialogHeader>
        <div
          className="grid grid-cols-1 gap-4 mt-4 transition-all duration-200"
          role="region"
          aria-label={`Lista de servicios de motomandados en ${cityName}`}
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="h-32 bg-muted-foreground/10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : !filteredCompanies?.length ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-muted-foreground text-lg">
                {searchQuery
                  ? 'No se encontraron servicios que coincidan con tu búsqueda.'
                  : 'No hay servicios de motomandados disponibles en esta ciudad.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 transition-all duration-200">
              {filteredCompanies.map((company) => (
                <DeliveryCompanyCard key={company.name} company={company} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
