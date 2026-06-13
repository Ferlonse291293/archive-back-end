export declare const loginService: ({ username, password }: {
    username: string;
    password: string;
}) => Promise<{
    token: string;
    refreshToken: string;
    csrfToken: `${string}-${string}-${string}-${string}-${string}`;
} | null>;
export declare const refreshService: (refreshToken: string) => Promise<{
    token: string;
} | null>;
export declare const profileService: (token: string) => Promise<{
    id: any;
    username: any;
} | null>;
//# sourceMappingURL=auth.service.d.ts.map