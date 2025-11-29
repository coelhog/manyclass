import { Integration } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, Power, Settings2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface IntegrationCardProps {
  integration: Integration
  onConnect: (integration: Integration) => void
  onDisconnect: (integration: Integration) => void
  isLoading?: boolean
}

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isLoading,
}: IntegrationCardProps) {
  const isConnected = integration.status === 'connected'

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="flex-row gap-4 items-start space-y-0">
        <div className="h-12 w-12 rounded-lg border bg-muted/10 flex items-center justify-center p-2">
          <Avatar className="h-full w-full bg-transparent">
            <AvatarImage
              src={integration.logo}
              alt={integration.name}
              className="object-contain"
            />
            <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{integration.name}</CardTitle>
            {isConnected && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                Conectado
              </Badge>
            )}
          </div>
          <CardDescription className="mt-1 line-clamp-2">
            {integration.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {isConnected && integration.connectedAt && (
          <p className="text-xs text-muted-foreground">
            Conectado em{' '}
            {new Date(integration.connectedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        {isConnected ? (
          <>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Settings2 className="mr-2 h-4 w-4" />
              Configurar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDisconnect(integration)}
              disabled={isLoading}
            >
              <Power className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onConnect(integration)}
            disabled={isLoading}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Conectar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
