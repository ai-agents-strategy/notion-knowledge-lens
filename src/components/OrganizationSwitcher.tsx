
import { useState } from 'react';
import { useOrganization, useOrganizationList } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const OrganizationSwitcher = () => {
  const { organization } = useOrganization();
  const { 
    userMemberships, 
    setActive, 
    createOrganization 
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const handleOrganizationChange = async (orgId: string) => {
    if (orgId === 'create-new') {
      // This would typically open a modal to create a new organization
      // For now, we'll just show a placeholder
      console.log('Create new organization clicked');
      return;
    }

    if (orgId === 'personal') {
      await setActive({ organization: null });
      return;
    }

    const targetOrg = userMemberships?.data?.find(
      ({ organization: org }) => org.id === orgId
    );

    if (targetOrg) {
      await setActive({ organization: targetOrg.organization });
    }
  };

  const currentOrgId = organization?.id || 'personal';
  const currentOrgName = organization?.name || 'Personal Account';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Building2 className="w-4 h-4" />
        <span className="font-medium">Organization</span>
      </div>
      
      <Select value={currentOrgId} onValueChange={handleOrganizationChange}>
        <SelectTrigger className="w-full bg-white border-gray-300 text-black">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium">
              {currentOrgName.charAt(0).toUpperCase()}
            </div>
            <SelectValue>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{currentOrgName}</span>
                {!organization && (
                  <Badge variant="secondary" className="text-xs">
                    Personal
                  </Badge>
                )}
              </div>
            </SelectValue>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectTrigger>
        
        <SelectContent className="w-full bg-white border border-gray-200 shadow-lg">
          {/* Personal Account */}
          <SelectItem value="personal" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Personal Account</span>
                <span className="text-xs text-gray-500">Individual workspace</span>
              </div>
            </div>
          </SelectItem>

          {/* Organization List */}
          {userMemberships?.data?.map(({ organization: org }) => (
            <SelectItem key={org.id} value={org.id} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-medium text-blue-600">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-xs text-gray-500">
                    {org.membersCount} member{org.membersCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}

          {/* Create New Organization */}
          <SelectItem value="create-new" className="cursor-pointer border-t border-gray-100 mt-1">
            <div className="flex items-center gap-2 text-blue-600">
              <Plus className="w-4 h-4" />
              <span className="font-medium">Create Organization</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
