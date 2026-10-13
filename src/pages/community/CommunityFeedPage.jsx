import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [showLikesModalPost, setShowLikesModalPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  // Demo fallback profiles for posts that only have numbers or empty likes
  const demoFallbackLikers = [
    { id: 'M1001', name: 'अमोल जाधव', avatar: '👨', city: 'पुणे', kul: '९६ कुळी जाधव' },
    { id: 'M1002', name: 'प्रिया देशमुख', avatar: '👩', city: 'मुंबई', kul: '९६ कुळी देशमुख' },
    { id: 'M1003', name: 'रोहित मोरे', avatar: '🧗', city: 'नाशिक', kul: '९६ कुळी मोरे' },
    { id: 'M1004', name: 'महेश कदम', avatar: '👔', city: 'सातारा', kul: '९६ कुळी कदम' },
    { id: 'M1008', name: 'विकास गायकवाड', avatar: '🏭', city: 'कोल्हापूर', kul: '९६ कुळी गायकवाड' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, groupsRes] = await Promise.all([
        api.community.getPosts(selectedGroup),
        api.community.getGroups()
      ]);
      if (postsRes && postsRes.posts) {
        // Normalize posts data so liked_by and comments have rich profile objects
        const enriched = postsRes.posts.map(p => {
          let likedByArr = [];
          if (Array.isArray(p.likedBy) && p.likedBy.length > 0) {
            likedByArr = p.likedBy.map(item => {
              if (typeof item === 'object' && item !== null && item.name) return item;
              return { id: item, name: 'मराठा सदस्य', avatar: '👤', city: 'महाराष्ट्र', kul: '९६ कुळी मराठा' };
            });
          } else if (Array.isArray(p.liked_by) && p.liked_by.length > 0) {
            likedByArr = p.liked_by;
          } else if ((p.likes || p.likes_count || 0) > 0) {
            // Provide representative likers if count > 0 but array empty
            likedByArr = demoFallbackLikers.slice(0, Math.min(5, p.likes || p.likes_count || 3));
          }

          let commentsArr = [];
          if (Array.isArray(p.comments) && p.comments.length > 0) {
            commentsArr = p.comments.map(c => ({
              id: c.id || `C-${Math.random().toString(36).substr(2, 4)}`,
              author: c.author || c.author_name || 'मराठा बांधव',
              author_name: c.author || c.author_name || 'मराठा बांधव',
              author_id: c.authorId || c.author_id || '',
              author_avatar: c.authorAvatar || c.author_avatar || c.avatar || '🚩',
              author_city: c.authorCity || c.city || 'पुणे',
              author_kul: c.authorKul || c.kul || '९६ कुळी',
              text: c.text || '',
              created_at: c.createdAt || c.created_at || new Date().toISOString()
            }));
          }

          return {
            ...p,
            author_name: p.author || p.author_name || 'मराठा समाज सदस्य',
            author_avatar: p.avatar || p.author_avatar || '👤',
            author_city: p.city || 'महाराष्ट्र',
            author_kul: p.kul || '९६ कुळी',
            text: p.content || p.text,
            likes_count: p.likes || p.likes_count || likedByArr.length,
            liked_by: likedByArr,
            comments: commentsArr
          };
        });
        setPosts(enriched);
      }
      if (groupsRes && groupsRes.groups) setGroups(groupsRes.groups);
    } catch (err) {
      console.warn('Error loading community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.community.createPost({
        author_id: user?.id || 'M1001',
        author_name: user?.name || 'अमोल जाधव',
        author_avatar: user?.avatar || '👨',
        content: newPostText,
        text: newPostText,
        group_id: selectedGroup || 'G09'
      });

      const newPostObj = res?.post || {
        id: `POST-${Date.now()}`,
        author_name: user?.name || 'अमोल जाधव',
        author_avatar: user?.avatar || '👨',
        author_city: user?.district || user?.city || 'पुणे',
        author_kul: user?.kul || '९६ कुळी',
        text: newPostText,
        created_at: new Date().toISOString(),
        likes_count: 0,
        liked_by: [],
        comments: []
      };

      setPosts([
        {
          ...newPostObj,
          author_name: newPostObj.author || newPostObj.author_name || user?.name || 'अमोल जाधव',
          author_avatar: newPostObj.avatar || newPostObj.author_avatar || user?.avatar || '👨',
          author_city: user?.district || user?.city || 'पुणे',
          author_kul: user?.kul || '९६ कुळी',
          text: newPostObj.content || newPostObj.text || newPostText,
          likes_count: 0,
          liked_by: [],
          comments: []
        },
        ...posts
      ]);
      setNewPostText('');
    } catch (err) {
      alert('पोस्ट करताना त्रुटी आली: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    const currentUserProfile = {
      id: user?.id || 'M1001',
      name: user?.name || 'अमोल जाधव',
      avatar: user?.avatar || '👨',
      city: user?.district || user?.city || 'पुणे',
      kul: user?.kul || '९६ कुळी जाधव'
    };

    // Optimistic UI update
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        const currentLikedBy = Array.isArray(p.liked_by) ? [...p.liked_by] : [];
        const existingIndex = currentLikedBy.findIndex(item => String(item.id) === String(currentUserProfile.id));

        let updatedLikedBy;
        let updatedCount;

        if (existingIndex > -1) {
          // Unlike
          updatedLikedBy = currentLikedBy.filter((_, i) => i !== existingIndex);
          updatedCount = Math.max(0, (p.likes_count || 1) - 1);
        } else {
          // Like
          updatedLikedBy = [currentUserProfile, ...currentLikedBy];
          updatedCount = (p.likes_count || 0) + 1;
        }

        return {
          ...p,
          likes_count: updatedCount,
          liked_by: updatedLikedBy
        };
      })
    );

    try {
      const res = await api.community.likePost(postId);
      if (res && res.likedBy) {
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? { ...p, likes_count: res.likes || res.likes_count || res.likedBy.length, liked_by: res.likedBy }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newCommentObj = {
      id: `CMT-${Date.now()}`,
      author: user?.name || 'अमोल जाधव',
      author_name: user?.name || 'अमोल जाधव',
      author_id: user?.id || 'M1001',
      author_avatar: user?.avatar || '👨',
      author_city: user?.district || user?.city || 'पुणे',
      author_kul: user?.kul || '९६ कुळी जाधव',
      text: text.trim(),
      created_at: new Date().toISOString()
    };

    // Optimistic local update
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const currentComments = Array.isArray(p.comments) ? [...p.comments] : [];
        return {
          ...p,
          comments: [...currentComments, newCommentObj]
        };
      })
    );
    setCommentInputs({ ...commentInputs, [postId]: '' });

    try {
      const res = await api.community.addComment(postId, {
        author_id: user?.id || 'M1001',
        author_name: user?.name || 'अमोल जाधव',
        author_avatar: user?.avatar || '👨',
        author_city: user?.district || user?.city || 'पुणे',
        author_kul: user?.kul || '९६ कुळी जाधव',
        text: text.trim()
      });

      if (res && res.comments) {
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? {
                  ...p,
                  comments: res.comments.map(c => ({
                    id: c.id,
                    author: c.author || c.author_name,
                    author_name: c.author || c.author_name,
                    author_id: c.authorId || c.author_id,
                    author_avatar: c.authorAvatar || c.author_avatar || c.avatar || '👤',
                    author_city: c.authorCity || c.city || 'पुणे',
                    author_kul: c.authorKul || c.kul || '',
                    text: c.text,
                    created_at: c.createdAt || c.created_at
                  }))
                }
              : p
          )
        );
      }
    } catch (err) {
      alert('प्रतिक्रिया देताना त्रुटी: ' + err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.community.joinGroup(groupId);
      alert('आपण या गटात यशस्वीरित्या सामील झालात!');
      setGroups(groups.map(g => g.id === groupId ? { ...g, members_count: (g.members_count || 0) + 1 } : g));
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  // Active likers modal data
  const currentModalPost = showLikesModalPost ? posts.find(p => p.id === showLikesModalPost) : null;

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Page Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              🚩 मराठा समुदाय संवाद
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              मराठा समुदाय व संवाद मंच
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              महाराष्ट्रासह देश-विदेशातील मराठा बांधवांचे विचारमंथन, स्थानिक गट, सामाजिक उपक्रम आणि परस्पर सहकार्याचे महाव्यासपीठ.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/card" className="btn btn-primary" style={{ background: '#fff', color: '#C73800', border: 'none', padding: '10px 18px', fontWeight: 700, borderRadius: '8px', textDecoration: 'none' }}>
              🪪 सदस्य ओळखपत्र
            </Link>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar (Groups) + Main Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Left Column: Community Groups */}
          <div>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: '#C73800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥</span> मराठा समुदाय गट
              </h3>
              
              <button
                onClick={() => setSelectedGroup('')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedGroup === '' ? '#FFF3E0' : 'transparent',
                  color: selectedGroup === '' ? '#C73800' : '#4B5563',
                  fontWeight: selectedGroup === '' ? 700 : 500,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                <span>🌐 सर्वसमावेशक मुख्य फीड</span>
                <span style={{ fontSize: '0.8rem', background: '#FFCC80', padding: '2px 8px', borderRadius: '10px' }}>सर्व</span>
              </button>

              <div style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
                {groups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: selectedGroup === group.id ? '#FFF3E0' : '#F9FAFB',
                      border: selectedGroup === group.id ? '1px solid #FFB74D' : '1px solid #F3F4F6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedGroup === group.id ? '#C73800' : '#1F2937' }}>
                        {group.cover} {group.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {group.members_count} सदस्य
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.4 }}>
                      {group.desc}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
                      style={{
                        marginTop: '8px',
                        background: 'none',
                        border: '1px solid #E65100',
                        color: '#E65100',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                      + सामील व्हा
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Community Helpline widget */}
            <div style={{ background: '#FFF8F2', borderRadius: '14px', padding: '18px', border: '1px solid #FFCC80' }}>
              <div style={{ fontWeight: 700, color: '#C73800', marginBottom: '6px', fontSize: '0.95rem' }}>
                🤝 आणीबाणी समाज साहाय्य
              </div>
              <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>
                रक्तदान, वैद्यकीय मदत किंवा संकटसमयी २४/७ मराठा हेल्पलाइनशी थेट संपर्क साधा.
              </p>
              <div style={{ fontWeight: 800, color: '#C73800', fontSize: '1.1rem' }}>
                📞 १८००-२३३-१९८१
              </div>
            </div>
          </div>

          {/* Right Column: Post Composer & Live Posts Feed */}
          <div>
            
            {/* Post Composer */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem' }}>{user?.avatar || '👨'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1F2937' }}>{user?.name || 'अमोल जाधव'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {user?.district ? `${user.district} | ` : ''}आपले विचार किंवा उपक्रम समाजासोबत शेअर करा
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreatePost}>
                <textarea
                  rows="3"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="जय शिवराय! आजचा उपक्रम, ऐतिहासिक विचार किंवा समाजोपयोगी संदेश लिहा..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    marginBottom: '12px',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                    🚩 मराठा बंधुभाव
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newPostText.trim()}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #C73800, #E65100)',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 22px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: newPostText.trim() ? 'pointer' : 'not-allowed',
                      opacity: newPostText.trim() ? 1 : 0.6
                    }}>
                    {submitting ? 'प्रसिद्ध होत आहे...' : 'प्रसिद्ध करा (Post) 🚀'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                लोड होत आहे... कृपया थांबा ⏳
              </div>
            ) : posts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                <h3>या गटात अजून कोणतीही पोस्ट नाही.</h3>
                <p>पहिली पोस्ट करून संवादाला सुरुवात करा!</p>
              </div>
            ) : (
              posts.map(post => {
                const userHasLiked = Array.isArray(post.liked_by) && post.liked_by.some(
                  l => String(l.id) === String(user?.id || 'M1001')
                );
                const displayLikers = Array.isArray(post.liked_by) ? post.liked_by : [];

                return (
                  <div
                    key={post.id}
                    style={{
                      background: '#fff',
                      borderRadius: '14px',
                      padding: '24px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      marginBottom: '20px'
                    }}>
                    {/* Post Author Header with Profile */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem',
                          border: '2px solid #FFA726',
                          flexShrink: 0
                        }}>
                          {post.author_avatar || '👤'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: '#1F2937', fontSize: '1.02rem' }}>{post.author_name}</span>
                            <span style={{
                              background: '#FFF3E0',
                              color: '#C73800',
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 700
                            }}>
                              {post.author_kul || '९६ कुळी मराठा'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span>📍 {post.author_city || 'महाराष्ट्र'}</span>
                            <span>•</span>
                            <span>
                              {new Date(post.created_at || Date.now()).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{ background: '#FFF3E0', color: '#E65100', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #FFE0B2' }}>
                        🚩 समाज मंच
                      </span>
                    </div>

                    {/* Post Content */}
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#1F2937', margin: '0 0 16px' }}>
                      {post.text}
                    </p>

                    {/* Post Image (if any) */}
                    {post.image && (
                      <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', maxHeight: '380px' }}>
                        <img src={post.image} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}

                    {/* Who Liked Preview Strip with Avatars & Names */}
                    {displayLikers.length > 0 && (
                      <div
                        onClick={() => setShowLikesModalPost(post.id)}
                        style={{
                          background: '#FFF8F2',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          border: '1px solid #FFE0B2',
                          transition: 'background 0.2s'
                        }}
                        title="लाईक करणाऱ्यांची यादी पहा">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {/* Avatars Stack */}
                          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                            {displayLikers.slice(0, 4).map((liker, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  border: '2px solid #C73800',
                                  marginLeft: idx === 0 ? 0 : '-8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.85rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  zIndex: 5 - idx
                                }}
                                title={`${liker.name} (${liker.city || 'महाराष्ट्र'})`}>
                                {liker.avatar || '👤'}
                              </div>
                            ))}
                          </div>
                          
                          {/* Names text */}
                          <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                            <strong style={{ color: '#C73800' }}>
                              {displayLikers[0]?.name}
                            </strong>
                            {displayLikers.length > 1 && (
                              <span> आणि इतर <strong>{displayLikers.length - 1}</strong> बांधवांनी पसंत केले</span>
                            )}
                            {displayLikers.length === 1 && <span> यांनी पसंत केले</span>}
                          </div>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: '#C73800', fontWeight: 700, textDecoration: 'underline' }}>
                          सर्व पहा &gt;
                        </span>
                      </div>
                    )}

                    {/* Post Interactions (Likes & Comments Count Action Buttons) */}
                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '12px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          background: userHasLiked ? '#FFF0EB' : 'none',
                          border: userHasLiked ? '1px solid #FFAB91' : 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          color: userHasLiked ? '#C73800' : '#4B5563',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}>
                        <span>{userHasLiked ? '❤️ पसंत केले' : '🤍 आवडले'}</span>
                        <span>({post.likes_count || displayLikers.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                        style={{
                          background: activeCommentPost === post.id ? '#F3F4F6' : 'none',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          color: '#4B5563',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                        <span>💬 प्रतिक्रिया</span>
                        <span>({post.comments ? post.comments.length : 0})</span>
                      </button>
                    </div>

                    {/* Comments Section with Profile Details */}
                    {activeCommentPost === post.id && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                        <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.92rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💬</span> समाज प्रतिक्रिया ({post.comments ? post.comments.length : 0})
                        </div>

                        {/* Existing comments with Profiles */}
                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((c, i) => (
                              <div
                                key={c.id || i}
                                style={{
                                  background: '#F9FAFB',
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid #F0F0F0',
                                  display: 'flex',
                                  gap: '12px',
                                  alignItems: 'flex-start'
                                }}>
                                {/* Commenter Profile Avatar */}
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#FFF3E0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.25rem',
                                  border: '1.5px solid #FFB74D',
                                  flexShrink: 0
                                }}>
                                  {c.author_avatar || c.avatar || '🚩'}
                                </div>

                                {/* Commenter Info & Text */}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>
                                        {c.author_name || c.author}
                                      </span>
                                      {(c.author_kul || c.kul) && (
                                        <span style={{ background: '#FFE0B2', color: '#C73800', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '6px', fontWeight: 600 }}>
                                          {c.author_kul || c.kul}
                                        </span>
                                      )}
                                      {(c.author_city || c.city) && (
                                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                          📍 {c.author_city || c.city}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                                      {new Date(c.created_at || Date.now()).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.5 }}>
                                    {c.text}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.85rem', color: '#9CA3AF', padding: '8px 0' }}>
                              अजून कोणतीही प्रतिक्रिया नाही. पहिली प्रतिक्रिया द्या!
                            </div>
                          )}
                        </div>

                        {/* Add comment input with current user avatar */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#FFF3E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            border: '1.5px solid #FFB74D',
                            flexShrink: 0
                          }}>
                            {user?.avatar || '👨'}
                          </div>
                          <input
                            type="text"
                            placeholder="आपली प्रतिक्रिया / विचार येथे लिहा..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #D1D5DB',
                              fontFamily: 'inherit',
                              fontSize: '0.92rem',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            style={{
                              background: '#C73800',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                            पाठवा
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Likers Modal - Displays complete profiles of everyone who liked the post */}
      {currentModalPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }} onClick={() => setShowLikesModalPost(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFF8F2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>❤️</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#C73800' }}>
                  पसंत करणारे मराठा बांधव ({currentModalPost.liked_by?.length || currentModalPost.likes_count || 0})
                </span>
              </div>
              <button
                onClick={() => setShowLikesModalPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: '#6B7280',
                  lineHeight: 1
                }}>
                ✕
              </button>
            </div>

            {/* Likers List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {currentModalPost.liked_by && currentModalPost.liked_by.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentModalPost.liked_by.map((liker, idx) => (
                    <div
                      key={liker.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: '#F9FAFB',
                        border: '1px solid #F0F0F0'
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          border: '2px solid #FFA726',
                          flexShrink: 0
                        }}>
                          {liker.avatar || '👤'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                            {liker.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: '6px' }}>
                            <span>📍 {liker.city || 'महाराष्ट्र'}</span>
                            {liker.kul && <span>• {liker.kul}</span>}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        background: '#FFF3E0',
                        color: '#C73800',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '8px'
                      }}>
                        🚩 सदस्य
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  अजून कोणीही लाईक केले नाही.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', textAlign: 'right', background: '#FAFAFA' }}>
              <button
                onClick={() => setShowLikesModalPost(null)}
                style={{
                  background: '#C73800',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
