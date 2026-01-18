import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type ModerationAction = {
  id: string;
  moderator: string;
  action: 'ban' | 'mute' | 'warn';
  user: string;
  reason: string;
  timestamp: string;
};

type FilterSettings = {
  links: boolean;
  invites: boolean;
  spam: boolean;
  caps: boolean;
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState<FilterSettings>({
    links: true,
    invites: true,
    spam: true,
    caps: false,
  });

  const stats = {
    totalBans: 42,
    totalMutes: 128,
    totalWarns: 315,
    blockedMessages: 1247,
  };

  const recentActions: ModerationAction[] = [
    { id: '1', moderator: 'Admin', action: 'ban', user: '@spammer123', reason: 'Спам-сообщения', timestamp: '2 мин назад' },
    { id: '2', moderator: 'Модератор', action: 'mute', user: '@user456', reason: 'Флуд в чате', timestamp: '15 мин назад' },
    { id: '3', moderator: 'Модератор', action: 'warn', user: '@newbie789', reason: 'Использование ссылок', timestamp: '1 час назад' },
    { id: '4', moderator: 'Младший модератор', action: 'warn', user: '@member321', reason: 'Caps Lock', timestamp: '2 часа назад' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ban': return 'bg-destructive text-destructive-foreground';
      case 'mute': return 'bg-yellow-500/20 text-yellow-500';
      case 'warn': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ban': return 'Ban';
      case 'mute': return 'Volume2';
      case 'warn': return 'AlertTriangle';
      default: return 'Shield';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon name="Shield" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Модератор Бот</h1>
              <p className="text-muted-foreground">Панель управления и статистика</p>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" className="h-4 w-4" />
              <span className="hidden sm:inline">Дашборд</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-2">
              <Icon name="Gavel" className="h-4 w-4" />
              <span className="hidden sm:inline">Модерация</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Icon name="Filter" className="h-4 w-4" />
              <span className="hidden sm:inline">Фильтры</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Icon name="ScrollText" className="h-4 w-4" />
              <span className="hidden sm:inline">Логи</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Icon name="Users" className="h-4 w-4" />
              <span className="hidden sm:inline">Роли</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Icon name="Ban" className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Баны</p>
                    <p className="text-2xl font-bold">{stats.totalBans}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Icon name="VolumeX" className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Муты</p>
                    <p className="text-2xl font-bold">{stats.totalMutes}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon name="AlertTriangle" className="h-6 w-6 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Предупреждения</p>
                    <p className="text-2xl font-bold">{stats.totalWarns}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Shield" className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Заблокировано</p>
                    <p className="text-2xl font-bold">{stats.blockedMessages}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Activity" className="h-5 w-5 text-primary" />
                Последние действия
              </h2>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getActionColor(action.action)}`}>
                        <Icon name={getActionIcon(action.action)} className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{action.user}</span>
                          <Badge variant="outline" className="text-xs">{action.action}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.reason}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">{action.timestamp}</p>
                        <p className="text-xs text-muted-foreground">от {action.moderator}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Gavel" className="h-5 w-5 text-primary" />
                Быстрые действия
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">ID или @username пользователя</Label>
                  <Input id="username" placeholder="@username или 123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Причина</Label>
                  <Input id="reason" placeholder="Укажите причину действия" />
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button className="gap-2" variant="destructive">
                    <Icon name="Ban" className="h-4 w-4" />
                    Забанить
                  </Button>
                  <Button className="gap-2" variant="secondary">
                    <Icon name="VolumeX" className="h-4 w-4" />
                    Замутить
                  </Button>
                  <Button className="gap-2" variant="outline">
                    <Icon name="AlertTriangle" className="h-4 w-4" />
                    Предупредить
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="UserX" className="h-5 w-5 text-primary" />
                Список забаненных
              </h2>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {['@spammer123', '@bot_faker', '@scammer999'].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user[1]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user}</p>
                          <p className="text-xs text-muted-foreground">Забанен навсегда</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Icon name="Unlock" className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Icon name="Filter" className="h-5 w-5 text-primary" />
                Настройки автопроверки
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="links" className="text-base font-medium">Блокировка ссылок</Label>
                    <p className="text-sm text-muted-foreground">Удалять сообщения с URL-адресами</p>
                  </div>
                  <Switch
                    id="links"
                    checked={filters.links}
                    onCheckedChange={(checked) => setFilters({ ...filters, links: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="invites" className="text-base font-medium">Блокировка приглашений</Label>
                    <p className="text-sm text-muted-foreground">Удалять приглашения в другие чаты</p>
                  </div>
                  <Switch
                    id="invites"
                    checked={filters.invites}
                    onCheckedChange={(checked) => setFilters({ ...filters, invites: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="spam" className="text-base font-medium">Антиспам</Label>
                    <p className="text-sm text-muted-foreground">Определение спам-паттернов</p>
                  </div>
                  <Switch
                    id="spam"
                    checked={filters.spam}
                    onCheckedChange={(checked) => setFilters({ ...filters, spam: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="caps" className="text-base font-medium">Caps Lock фильтр</Label>
                    <p className="text-sm text-muted-foreground">Предупреждать за злоупотребление</p>
                  </div>
                  <Switch
                    id="caps"
                    checked={filters.caps}
                    onCheckedChange={(checked) => setFilters({ ...filters, caps: checked })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="List" className="h-5 w-5 text-primary" />
                Ключевые слова для блокировки
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Добавить запрещённое слово..." />
                  <Button size="icon">
                    <Icon name="Plus" className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['казино', 'заработок', 'халява'].map((word) => (
                    <Badge key={word} variant="secondary" className="gap-2">
                      {word}
                      <Icon name="X" className="h-3 w-3 cursor-pointer hover:text-destructive" />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="ScrollText" className="h-5 w-5 text-primary" />
                История действий модераторов
              </h2>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getActionColor(action.action)}`}>
                        <Icon name={getActionIcon(action.action)} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{action.moderator}</span>
                          <Icon name="ArrowRight" className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline">{action.action}</Badge>
                          <Icon name="ArrowRight" className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{action.user}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.reason}</p>
                        <p className="text-xs text-muted-foreground">{action.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Users" className="h-5 w-5 text-primary" />
                Управление ролями и правами
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Администратор', users: 2, color: 'bg-destructive', permissions: 'Все права' },
                  { name: 'Модератор', users: 5, color: 'bg-primary', permissions: 'Бан, мут, варн' },
                  { name: 'Младший модератор', users: 12, color: 'bg-accent', permissions: 'Мут, варн' },
                ].map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg ${role.color} flex items-center justify-center text-white font-bold`}>
                        {role.users}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.permissions}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Icon name="Settings" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
