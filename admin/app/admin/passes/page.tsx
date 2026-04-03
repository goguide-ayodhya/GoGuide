"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Ticket, IndianRupee } from "lucide-react"
import { mockPasses, type Pass } from "@/lib/mock-data"

export default function PassesPage() {
  const [passes, setPasses] = useState<Pass[]>(mockPasses)
  const [editingPass, setEditingPass] = useState<Pass | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    validity: "",
    price: "",
    category: "token" as "token" | "vip"
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      validity: "",
      price: "",
      category: "token"
    })
    setEditingPass(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (pass: Pass) => {
    setEditingPass(pass)
    setFormData({
      name: pass.name,
      description: pass.description,
      validity: pass.validity,
      price: pass.price.toString(),
      category: pass.category
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.price) return

    if (editingPass) {
      setPasses(prev => prev.map(p => 
        p.id === editingPass.id 
          ? { 
              ...p, 
              name: formData.name,
              description: formData.description,
              validity: formData.validity,
              price: parseFloat(formData.price),
              category: formData.category
            }
          : p
      ))
    } else {
      const newPass: Pass = {
        id: `PS${(passes.length + 1).toString().padStart(3, '0')}`,
        name: formData.name,
        description: formData.description,
        validity: formData.validity,
        price: parseFloat(formData.price),
        category: formData.category
      }
      setPasses(prev => [...prev, newPass])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (passId: string) => {
    setPasses(prev => prev.filter(p => p.id !== passId))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Token / VIP Pass Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage token and VIP pass pricing.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="h-11 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Pass
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{editingPass ? "Edit Pass" : "Add New Pass"}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingPass ? "Update pass details and pricing." : "Create a new token or VIP pass."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 sm:py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Pass Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Temple Token Pass"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the pass benefits..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validity" className="text-xs sm:text-sm">Validity</Label>
                  <Input
                    id="validity"
                    value={formData.validity}
                    onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
                    placeholder="e.g., 1 Day"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs sm:text-sm">Price</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-10 h-11"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: "token" | "vip") => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token">Token Pass</SelectItem>
                    <SelectItem value="vip">VIP Pass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name || !formData.price} className="h-11">
                {editingPass ? "Save Changes" : "Add Pass"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Passes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {passes.map((pass) => (
          <Card key={pass.id} className="border-border">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${pass.category === 'vip' ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Ticket className={`w-4 h-4 sm:w-5 sm:h-5 ${pass.category === 'vip' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm sm:text-base truncate">{pass.name}</CardTitle>
                    <Badge variant={pass.category === 'vip' ? 'default' : 'secondary'} className="mt-1 text-[10px] sm:text-xs">
                      {pass.category === 'vip' ? 'VIP Pass' : 'Token Pass'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <CardDescription className="text-xs sm:text-sm line-clamp-2">{pass.description}</CardDescription>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Validity</p>
                  <p className="text-xs sm:text-sm font-medium">{pass.validity}</p>
                </div>
                <div className="text-right space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Price</p>
                  <p className="text-base sm:text-lg font-semibold flex items-center gap-0.5 justify-end">
                    <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {pass.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 sm:pt-3 border-t border-border">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 text-xs sm:text-sm"
                  onClick={() => openEditDialog(pass)}
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="h-10 w-10 text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(pass.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
