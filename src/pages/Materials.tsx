import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Search, FileText, Download, Eye } from 'lucide-react'

export default function Materials() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Upload de Material
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar materiais..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card
            key={i}
            className="group hover:border-primary transition-colors"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="bg-muted p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-base line-clamp-1">
                Apostila de Gramática Avançada {i}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                PDF • 2.4 MB • 12/05/2024
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" title="Visualizar">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Baixar">
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
