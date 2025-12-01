import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';

passport.use(
    'local',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({
                    email: email.toLowerCase(),
                    isDeleted: false
                }).select('+password');

                if (!user) {
                    return done(null, false, {
                        message: 'User not found with this email'
                    });
                }

                if (!user.isEmailVerified) {
                    return done(null, false, {
                        message: 'Please verify your email first'
                    });
                }

                if (user.status === 'suspended') {
                    return done(null, false, {
                        message: 'Your account has been suspended'
                    });
                }

                if (user.status === 'deleted') {
                    return done(null, false, {
                        message: 'Your account has been deleted'
                    });
                }

                const isMatch = await user.comparePassword(password);

                if (!isMatch) {
                    user.incrementLoginAttempts();
                    await user.save();
                    return done(null, false, {
                        message: 'Password is incorrect'
                    });
                }

                user.resetLoginAttempts();
                await user.save();

                return done(null, user);
            } catch (error) {
                console.error(`Local authentication error: ${error.message}`);
                return done(error);
            }
        }
    )
);

passport.use(
    'google',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/oauth/google/callback',
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const avatar = profile.photos?.[0]?.value;
                const googleId = profile.id;

                if (!email) {
                    return done(null, false, {
                        message: 'Email not provided by Google'
                    });
                }

                let user = await User.findOne({
                    email: email.toLowerCase(),
                    isDeleted: false
                });

                if (user) {
                    if (!user.oauthConnections) {
                        user.oauthConnections = [];
                    }

                    const googleConnection = user.oauthConnections.find(
                        conn => conn.provider === 'google'
                    );

                    if (!googleConnection) {
                        user.oauthConnections.push({
                            provider: 'google',
                            providerId: googleId,
                            email: email,
                            connectedAt: new Date()
                        });
                    }

                    user.isEmailVerified = true;

                    if (avatar && !user.profileImage) {
                        user.profileImage = avatar;
                    }

                    await user.save();
                    return done(null, user);
                }

                const nameParts = name?.split(' ') || ['', ''];
                const newUser = new User({
                    firstName: nameParts[0] || 'User',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: email.toLowerCase(),
                    profileImage: avatar,
                    isEmailVerified: true,
                    authProvider: 'google',
                    status: 'active',
                    oauthConnections: [
                        {
                            provider: 'google',
                            providerId: googleId,
                            email: email,
                            connectedAt: new Date()
                        }
                    ]
                });

                await newUser.save();

                const organization = new Organization({
                    name: `${newUser.firstName}'s Organization`,
                    superAdmin: newUser._id,
                    members: [
                        {
                            userId: newUser._id,
                            role: 'superadmin',
                            status: 'active',
                            joinedAt: new Date()
                        }
                    ]
                });

                await organization.save();

                newUser.addOrganizationMembership(organization._id, 'superadmin');
                await newUser.save();

                return done(null, newUser);
            } catch (error) {
                console.error(`Google authentication error: ${error.message}`);
                return done(error);
            }
        }
    )
);

passport.use(
    'github',
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/v1/oauth/github/callback',
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName || profile.username;
                const avatar = profile.photos?.[0]?.value;
                const githubId = profile.id;
                const bio = profile._json?.bio;

                if (!email) {
                    return done(null, false, {
                        message: 'Email not provided by GitHub. Please make your email public on GitHub.'
                    });
                }

                let user = await User.findOne({
                    email: email.toLowerCase(),
                    isDeleted: false
                });

                if (user) {
                    if (!user.oauthConnections) {
                        user.oauthConnections = [];
                    }

                    const githubConnection = user.oauthConnections.find(
                        conn => conn.provider === 'github'
                    );

                    if (!githubConnection) {
                        user.oauthConnections.push({
                            provider: 'github',
                            providerId: githubId,
                            email: email,
                            connectedAt: new Date()
                        });
                    }

                    user.isEmailVerified = true;

                    if (avatar && !user.profileImage) {
                        user.profileImage = avatar;
                    }

                    if (bio && !user.bio) {
                        user.bio = bio;
                    }

                    await user.save();
                    return done(null, user);
                }

                const nameParts = name?.split(' ') || ['', ''];
                const newUser = new User({
                    firstName: nameParts[0] || 'User',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: email.toLowerCase(),
                    profileImage: avatar,
                    bio: bio,
                    isEmailVerified: true,
                    authProvider: 'github',
                    status: 'active',
                    oauthConnections: [
                        {
                            provider: 'github',
                            providerId: githubId,
                            email: email,
                            connectedAt: new Date()
                        }
                    ]
                });

                await newUser.save();

                const organization = new Organization({
                    name: `${newUser.firstName}'s Organization`,
                    superAdmin: newUser._id,
                    members: [
                        {
                            userId: newUser._id,
                            role: 'superadmin',
                            status: 'active',
                            joinedAt: new Date()
                        }
                    ]
                });

                await organization.save();

                newUser.addOrganizationMembership(organization._id, 'superadmin');
                await newUser.save();

                return done(null, newUser);
            } catch (error) {
                console.error(`GitHub authentication error: ${error.message}`);
                return done(error);
            }
        }
    )
);

passport.use(
    'jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                ExtractJwt.fromUrlQueryParameter('token'),
                (req) => {
                    if (req.cookies && req.cookies.token) {
                        return req.cookies.token;
                    }
                    return null;
                }
            ]),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                const user = await User.findById(jwtPayload.userId);

                if (!user || user.isDeleted) {
                    return done(null, false);
                }

                if (user.status === 'suspended' || user.status === 'deleted') {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                console.error(`JWT authentication error: ${error.message}`);
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error(`User deserialization error: ${error.message}`);
        done(error);
    }
});

export default passport;